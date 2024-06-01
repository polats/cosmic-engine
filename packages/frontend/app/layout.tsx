"use client"

import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import type { Session } from "next-auth";
import {PrivyProvider} from '@privy-io/react-auth';

interface IScaffoldEthAppProps {
  children: React.ReactNode;
  session: Session | null;
}

const ScaffoldEthApp = ({ session, children }: IScaffoldEthAppProps) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          <ThemeProvider enableSystem>
            <ScaffoldEthAppWithProviders>
            <PrivyProvider
                appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
              >  
              {children}
              </PrivyProvider>
            </ScaffoldEthAppWithProviders>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;