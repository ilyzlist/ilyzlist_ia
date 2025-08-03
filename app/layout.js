import "../styles/globals.css";
import { Inter, League_Spartan } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SupabaseProvider } from "./supabase-provider"; // ✅

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
  display: "swap",
});

export const metadata = {
  title: "Ilyzlist",
  description: "Your family management app",
};

export const viewport = {
  themeColor: "#3742D1",
};

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${leagueSpartan.variable}`} lang="en">
      <body className="font-sans bg-[#E2EAFF]/66">
        <SupabaseProvider> {/* ✅ Wrap children */}
          {children}
        </SupabaseProvider>
        <ClientSideToaster />
      </body>
    </html>
  );
}

function ClientSideToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#3742D1",
          color: "#fff",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 500,
          padding: "12px 20px",
        },
      }}
    />
  );
}
