import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeAI | Next-Gen Lifestyle Analytics",
  description:
    "Unlock the data behind your daily habits. Our advanced AI predicts burnout risk, productivity peaks, and long-term well-being trends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-[Inter] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
