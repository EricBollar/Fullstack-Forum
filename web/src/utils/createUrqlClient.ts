import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from 'urql'
import { cacheExchange, Cache, QueryInput, Resolver } from '@urql/exchange-graphcache';
import { DeletePostMutationVariables, LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, VoteMutationVariables } from '../generated/graphql';
import { pipe, tap } from 'wonka';
import Router from "next/router";
import gql from 'graphql-tag'
import { isServer } from './isServer';

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
      const { parentKey: entityKey, fieldName } = info;
  
      const allFields = cache.inspectFields(entityKey);
      const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
      const size = fieldInfos.length;
      if (size === 0) {
        return undefined;
      }

      const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
      const isInCache = cache.resolve(entityKey, fieldKey);
      info.partial = !isInCache;
      const results: string[] = [];
      let hasMore;
      fieldInfos.forEach(fi => {
        const key = cache.resolve(entityKey, fi.fieldKey) as string;
        const data = cache.resolve(key, "posts") as string[];
        hasMore = cache.resolve(key, "hasMore") as boolean;
        results.push(...data)
      });

      return {
        __typename: "PaginatedPosts", // urql requires this
        hasMore, 
        posts: results
      };
    }
  };

const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            // not logged in
            if (error?.message.includes("not authenticated")) {
                Router.replace("/login");
            }
        })
    );
}

// allows typing for update query
function betterUpdateQuery<Result, Query> (
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query
  ) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
  }

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
    let cookie = null;
    if (isServer() && ctx?.req) {
        cookie = ctx.req.headers.cookie;
    }
    
    return ({
        url: process.env.NEXT_PUBLIC_API_URL as string,
        fetchOptions: {
            credentials: "include" as const,
            headers: cookie ? {
                cookie
            } : undefined
        },
        exchanges: [dedupExchange, cacheExchange({
            keys: {
                PaginatedPosts: () => null,
            },
            resolvers: {
                Query: {
                    // matches name in posts.graphql
                    posts: cursorPagination()
                },
            },
            updates: {
            Mutation: {
                // should probably destructure the following code in future...

                deletePost: (result, args, cache, info) => {
                    cache.invalidate({
                        __typename: "Post",
                        id: (args as DeletePostMutationVariables).id,
                    });
                },

                vote: (result, args, cache, info) => {
                    const {postId, value} = args as VoteMutationVariables;
                    const data = cache.readFragment(
                        gql`
                            fragment _idPointsVoteStatus on Post {
                                id
                                points
                                voteStatus
                            }
                        `,
                        { id: postId } as any
                    );
                    if (data) {
                        if (data.voteStatus === value) {
                            return;
                        }
                        let newPoints = data.points;
                        if (value !== 0) {
                            // flipping vote or first-time vote
                            newPoints += (!data.voteStatus ? 1 : 2) * value;
                        } else {
                            // undoing vote
                            newPoints -= data.voteStatus;
                        }
                        cache.writeFragment(
                            gql`
                                fragment _points on Post {
                                    points
                                    voteStatus
                                }
                               `,
                            {id: postId, points: newPoints, voteStatus: value} as any
                        );
                    }  
                    
                    // cache.invalidate("Query");     
                },

                createPost: (result, args, cache, info) => {
                    // this is the only way I could get it to work...
                    // not sure if this is terrible but I will leave for now
                    cache.invalidate("Query");
                },

                // update MeQuery to null for successful logout
                logout: (result, args, cache, info) => {
                    cache.invalidate("Query");   
                    betterUpdateQuery<LogoutMutation, MeQuery>(
                        cache,
                        {query: MeDocument},
                        result,
                        () => ({ me: null })
                    );
                },

                // update MeQuery upon new successful LoginMutation
                login: (result, args, cache, info) => {
                betterUpdateQuery<LoginMutation, MeQuery>(
                    cache, 
                    {query: MeDocument},
                    result,
                    (loginResult, query) => {
                    // something went wrong
                    if (loginResult.login.errors) {
                        return query
                    // successful login -> update MeQuery (qid cookie)
                    } else {
                        cache.invalidate("Query");   
                        return {
                        me: loginResult.login.user
                        }
                    }
                    }); 
                },

                // update MeQuery upon new successful RegisterMutation
                register: (result, args, cache, info) => {
                betterUpdateQuery<RegisterMutation, MeQuery>(
                    cache, 
                    {query: MeDocument},
                    result,
                    (registerResult, query) => {
                    // something went wrong
                    if (registerResult.register.errors) {
                        return query
                    // successful register -> update MeQuery (qid cookie)
                    } else {
                        cache.invalidate("Query");   
                        return {
                        me: registerResult.register.user
                        }
                    }
                    });
                },
            }
        }
    }), errorExchange, ssrExchange, fetchExchange],
})};