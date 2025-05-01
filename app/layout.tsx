import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { UserProvider } from "@auth0/nextjs-auth0/client"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Parliant.AI - Open-ended surveys conducted by AI",
  description:
    "Get to know your customers with AI-powered conversations. Collect deeper insights with open-ended surveys conducted by AI.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <UserProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}
