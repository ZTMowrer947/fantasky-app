/* eslint-disable react/jsx-props-no-spreading */
import { FC } from 'react';
import { createGlobalStyle } from 'styled-components';
import { AppProps } from 'next/app';
import { Provider } from 'next-auth/client';

import Footer from '../components/Footer';

import 'bootstrap/dist/css/bootstrap.css';
import Header from '../components/Header';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html, body, #__next {
    height: 100%;
  }
`;

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <div className="h-100 d-flex flex-column">
      <GlobalStyle />
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */}
      <Provider session={pageProps.session}>
        <Header />
        <div className="container-fluid w-100 flex-grow-1 flex-shrink-0 mt-4">
          <Component {...pageProps} />
        </div>
        <Footer />
      </Provider>
    </div>
  );
};

export default MyApp;
