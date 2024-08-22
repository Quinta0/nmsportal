import type { AppProps } from 'next/app';
import { AuthProvider } from '@/components/AuthProvider';
import ErrorBoundary from "@/components/ErrorBoundary";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <ErrorBoundary>
                <Component {...pageProps} />
            </ErrorBoundary>
        </AuthProvider>
    );
}

export default MyApp;
