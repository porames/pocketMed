import type { AppProps } from "next/app";
import Head from "next/head";
import "./globals.css";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>PocketMed Calculator</title>
                <meta
                    name="description"
                    content="Interactive Decision Making Tools in Emergency"
                />
            </Head>
            <Component {...pageProps} />
        </>
    );
}