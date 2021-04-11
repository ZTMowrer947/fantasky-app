/* eslint-disable react/jsx-props-no-spreading */
import { FC } from 'react';
import { createGlobalStyle } from 'styled-components';
import { AppProps } from 'next/app';
import { Provider } from 'next-auth/client';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
`;

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <GlobalStyle />
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */}
      <Provider session={pageProps.session}>
        <Component {...pageProps} />
      </Provider>
    </>
  );
};

export default MyApp;
