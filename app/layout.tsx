import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

// Geist(sans)는 한글 글리프가 없어 쓰지 않는다. 본문은 시스템 글꼴(ui.md 2장).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 뉴스 수집기",
  description: "해외 AI 뉴스를 한국어 요약 카드로 모아 보는 개인용 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <ClerkProvider signInUrl="/sign-in">{children}</ClerkProvider>
      </body>
    </html>
  );
}
