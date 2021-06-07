import { Box, GlobalStyles } from "@bigcommerce/big-design";
import type { AppProps } from "next/app";

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <GlobalStyles />

    <Box marginHorizontal="xxxLarge" marginVertical="xxLarge">
      <Component {...pageProps} />
    </Box>
  </>
);

export default MyApp;
