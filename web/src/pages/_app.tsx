import '../styles/globals.css'
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql'
import { AppProps } from 'next/app'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import Register from './register';

// allows typing for update query
function betterUpdateQuery<Result, Query> (
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const client = createClient({ 
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        // should probably destructure the following code in future...

        // update query for updating MeQuery upon new successful LoginMutation
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

        // update query for updating MeQuery upon new successful RegisterMutation
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
  }), fetchExchange],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp
