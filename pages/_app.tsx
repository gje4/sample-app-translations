import { AlertsManager, createAlertsManager, Box, GlobalStyles } from "@bigcommerce/big-design";
import type { AppProps } from "next/app";
import SessionProvider from '../context/session';

const MyApp = ({ Component, pageProps }: AppProps) => {  
  return (
    <>
      <GlobalStyles />

      <Box marginHorizontal="xxxLarge" marginVertical="xxLarge">
        <AlertsManager manager={alertsManager} />
        <SessionProvider>
          <Component {...pageProps} />
        </SessionProvider>
      </Box>
    </>
  );
}

export default MyApp;

export const alertsManager = createAlertsManager();