import '../styles/globals.css'
import { Provider, createClient } from 'urql'
import { AppProps } from 'next/app'

const client = createClient({ 
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp
