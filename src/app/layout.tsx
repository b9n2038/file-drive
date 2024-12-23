import type { Metadata } from 'next'
import { ConvexClientProvider } from './ConvexClientProvider'
import localFont from 'next/font/local'
import './globals.css'
import { Header } from './header'

import { Toaster } from "@/components/ui/toaster"

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})


export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexClientProvider>
          <Header />
          <Toaster />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  )
}
