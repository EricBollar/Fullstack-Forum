import '../styles/globals.css'
import { AppProps } from 'next/app'
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
    <Head>
      <title>Fullstack-Forum | Eric Bollar</title>
      <link rel="shortcut icon" href="/icon.png" />
    </Head>
    <Component {...pageProps} />
    </>
  );
}

export default MyApp
