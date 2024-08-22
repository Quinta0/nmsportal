import type { AppProps } from 'next/app'
import { AuthProvider } from '@/components/AuthProvider'
import ErrorBoundary from "@/components/ErrorBoundary";

function MyApp({ Component, pageProps }: AppProps) {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined'

    return (
        <>
            {isBrowser ? (
                <AuthProvider>
                    <ErrorBoundary>
                        <Component {...pageProps} />
                    </ErrorBoundary>
                </AuthProvider>
            ) : (
                <ErrorBoundary>
                    <Component {...pageProps} />
                </ErrorBoundary>
            )}
        </>
    )
}

export default MyApp