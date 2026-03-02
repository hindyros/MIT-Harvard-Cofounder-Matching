import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Founders Club — MIT × Harvard Cofounder Matching",
  description: "An exclusive platform connecting MIT and Harvard students to find their next cofounder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#FFFFFF",
          colorBackground: "#0A0A0B",
          colorInputBackground: "#141415",
          colorInputText: "#F5F5F5",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en">
        <head>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;700;900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
