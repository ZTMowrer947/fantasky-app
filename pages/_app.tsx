/* eslint-disable react/jsx-props-no-spreading */
import { FC } from 'react';
import { AppProps } from 'next/app';
import { Provider } from 'next-auth/client';

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default MyApp;
