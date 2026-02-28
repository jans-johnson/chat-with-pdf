import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import QueryProvider from "@providers/query-provider";
import { Toaster } from "react-hot-toast";
import { DbEventsProvider } from "@providers/db-events-provider";
import { UserProvider } from "@providers/user-provider";
import { ThemeProvider } from "next-themes";

import "./globals.css";

export const metadata: Metadata = {
  title: "PdfWizard",
  description: "Chat with your PDF documents using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <DbEventsProvider>
        <UserProvider>
          <html lang="en" suppressHydrationWarning>
            <body className={GeistSans.className}>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
              >
                {children}
              </ThemeProvider>
              <Toaster />
            </body>
          </html>
        </UserProvider>
      </DbEventsProvider>
    </QueryProvider>
  );
}
