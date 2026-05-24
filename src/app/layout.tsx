import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Fitness — Get Body in Shape & Stay Healthy",
  description:
    "A huge selection of health and fitness content, healthy recipes and transformation stories to help you get fit and stay fit. Join 500+ free workout videos and 350+ video tutorials.",
  keywords: [
    "fitness",
    "workout",
    "health",
    "gym",
    "exercise",
    "training",
    "BMI calculator",
    "weight loss",
  ],
  authors: [{ name: "Fitness Team" }],
  openGraph: {
    title: "Fitness — Get Body in Shape & Stay Healthy",
    description:
      "A huge selection of health and fitness content, healthy recipes and transformation stories.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#222222",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
