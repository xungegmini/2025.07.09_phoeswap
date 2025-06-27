// src/pages/_app.tsx
import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';

import AppBar from '../components/AppBar';
import Footer from '../components/Footer';
import { Providers } from '../providers';

import '../styles/globals.css';

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <>
          <Head>
            <title>Phoenix Swap</title>
            <meta name="description" content="The premier decentralized exchange on Solana." />
          </Head>
    
          <Providers>
            <div className="flex flex-col min-h-screen">
              <AppBar/>
              <main className="flex-grow">
                <Component {...pageProps} />
              </main>
              <Footer/>
            </div>
          </Providers>
        </>
    );
};

export default App;