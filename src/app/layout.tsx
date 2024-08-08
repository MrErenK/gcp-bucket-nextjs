import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Cool File Upload Service',
  description: 'Upload your files with style',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className='inter.className'>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover draggable newestOnTop={true} />
        </ThemeProvider>
      </body>
    </html>
  )
}