import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from 'urql'
import { cacheExchange, Cache, QueryInput, Resolver } from '@urql/exchange-graphcache';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import { pipe, tap } from 'wonka';
import Router from "next/router";

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
  
    //   const visited = new Set();
    //   let result: NullArray<string> = [];
    //   let prevOffset: number | null = null;
  
    //   for (let i = 0; i < size; i++) {
    //     const { fieldKey, arguments: args } = fieldInfos[i];
    //     if (args === null || !compareArgs(fieldArgs, args)) {
    //       continue;
    //     }
  
    //     const links = cache.resolve(entityKey, fieldKey) as string[];
    //     const currentOffset = args[offsetArgument];
  
    //     if (
    //       links === null ||
    //       links.length === 0 ||
    //       typeof currentOffset !== 'number'
    //     ) {
    //       continue;
    //     }
  
    //     const tempResult: NullArray<string> = [];
  
    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       tempResult.push(link);
    //       visited.add(link);
    //     }
  
    //     if (
    //       (!prevOffset || currentOffset > prevOffset) ===
    //       (mergeMode === 'after')
    //     ) {
    //       result = [...result, ...tempResult];
    //     } else {
    //       result = [...tempResult, ...result];
    //     }
  
    //     prevOffset = currentOffset;
    //   }
  
    //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    //   if (hasCurrentPage) {
    //     return result;
    //   } else if (!(info as any).store.schema) {
    //     return undefined;
    //   } else {
    //     info.partial = true;
    //     return result;
    //   }
    // };
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

export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: "include" as const,
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

            // update MeQuery to null for successful logout
            logout: (result, args, cache, info) => {
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
                    return {
                    me: registerResult.register.user
                    }
                }
                });
            },
        }
        }
    }), errorExchange, ssrExchange, fetchExchange],
});