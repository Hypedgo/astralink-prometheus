import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstraLink Prometheus",
  description: "Space Operations Mission Control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}