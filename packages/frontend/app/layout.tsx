import "@farcaster/auth-kit/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import type { Session } from "next-auth";

interface IScaffoldEthAppProps {
  children: React.ReactNode;
  session: Session | null;
}

const ScaffoldEthApp = ({ session, children }: IScaffoldEthAppProps) => {
  return (
    <html suppressHydrationWarning style={{height:'100vh'}}>
      <body style={{height:'100vh'}}>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders session={session}>
            {children}
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;