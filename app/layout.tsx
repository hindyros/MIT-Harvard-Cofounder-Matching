import type { Metadata } from "next";
import "./globals.css";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const hasValidClerkKey = clerkKey.length > 0 && !clerkKey.includes('REPLACE_ME');

export const metadata: Metadata = {
  title: "William x John — MIT × Harvard Cofounder Matching",
  description: "An exclusive platform connecting MIT and Harvard students to find their next cofounder.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shell = (
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
  );

  if (!hasValidClerkKey) {
    return shell;
  }

  const { ClerkProvider } = await import("@clerk/nextjs");
  const { dark } = await import("@clerk/themes");

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
      {shell}
    </ClerkProvider>
  );
}
