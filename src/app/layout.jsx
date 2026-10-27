import "./globals.css";

export const metadata = {
  title: "EssayCheck — Essay Analyzer",
  description:
    "Analyze essay structure, identify repeated words, and get instant writing feedback in your browser.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
