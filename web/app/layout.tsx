import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnapFinance — 截圖理財",
  description: "個人化、截圖驅動、隱私優先的 iOS 記帳 App 互動原型",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
