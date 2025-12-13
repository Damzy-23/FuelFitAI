import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import Footer from '../components/Footer'

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // Don't show footer on auth pages (they have their own layout)
  const showFooter = !['/login', '/register'].includes(router.pathname);

  return (
    <>
      <Component {...pageProps} />
      {showFooter && <Footer />}
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent {...props} />
      </ToastProvider>
    </AuthProvider>
  )
}

