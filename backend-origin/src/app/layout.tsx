import type { ReactNode } from "react";

export const metadata = {
  title: "Spike backend origin",
  description: "Fake PO3/RT for Stage C rewrites",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
