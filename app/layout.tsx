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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}