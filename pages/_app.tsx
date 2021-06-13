import { AlertsManager, createAlertsManager, Box, GlobalStyles } from "@bigcommerce/big-design";
import type { AppProps } from "next/app";

const MyApp = ({ Component, pageProps }: AppProps) => {  
  return (
    <>
      <GlobalStyles />

      <Box marginHorizontal="xxxLarge" marginVertical="xxLarge">
        <AlertsManager manager={alertsManager} />
        <Component {...pageProps} />
      </Box>
    </>
  );
}

export default MyApp;

export const alertsManager = createAlertsManager();