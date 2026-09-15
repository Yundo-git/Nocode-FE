import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import { AuthGate, isBareRoute, isPublicRoute } from "@/components/auth/AuthGate";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const page = <Component {...pageProps} />;

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className={inter.className}>
          <AuthGate>
            {isPublicRoute(router.pathname) || isBareRoute(router.pathname) ? (
              page
            ) : (
              <AppLayout>{page}</AppLayout>
            )}
          </AuthGate>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
