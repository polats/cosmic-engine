import "@farcaster/auth-kit/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import type { Session } from "next-auth";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { Toaster } from "react-hot-toast";

interface IScaffoldEthAppProps {
  children: React.ReactNode;
  session: Session | null;
}

const ScaffoldEthApp = ({ session, children }: IScaffoldEthAppProps) => {
  return (
    <html suppressHydrationWarning >
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders session={session}>
          <div className="flex flex-col h-full w-full">
            <Header />        
            <div className="grow">
              {children}
            </div>
            <Footer />
            <Toaster />
            </div>
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;