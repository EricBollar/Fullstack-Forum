import { dedupExchange, Exchange, fetchExchange } from 'urql'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import { pipe, tap } from 'wonka';
import Router from "next/router";

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