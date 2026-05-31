import { Providers } from "@/components/ThemeProvider";
import 'katex/dist/katex.min.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCQMate - MCQ Exam Platform",
  description: "Learn smartly, succeed in exams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors">
        <Providers>
          <main className="flex-grow flex flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}