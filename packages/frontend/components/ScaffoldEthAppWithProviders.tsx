"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme, cssStringFromTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { WagmiProvider } from "wagmi";
import { Toaster } from "react-hot-toast";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { ProgressBar } from "~~/components/scaffold-eth/ProgressBar";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { SessionProvider } from "next-auth/react";
import { PrivyProvider } from '@privy-io/react-auth';
import type { Session } from "next-auth"; 

const farcasterAuthKitConfig = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: "http://localhost:3000/login",
  domain: "localhost:3000",
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ session, children }: { session: Session | null, children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <SessionProvider session={session}>
        <WagmiProvider config={wagmiConfig}>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
              // Customize Privy's appearance in your app
              appearance: {
                theme: 'light',
                accentColor: '#676FFF',
                // logo: 'https://your-logo-url',
              },
              // Create embedded wallets for users who don't have a wallet
              embeddedWallets: {
                createOnLogin: 'users-without-wallets',
              },
            }}            
          >  
            <QueryClientProvider client={queryClient}>
              <ProgressBar />
              <AuthKitProvider config={farcasterAuthKitConfig}>
                <RainbowKitProvider
                  avatar={BlockieAvatar}
                  theme={null}
                >
                  {children}
                </RainbowKitProvider>
              </AuthKitProvider>
            </QueryClientProvider>
          </PrivyProvider> 
        </WagmiProvider>
      </SessionProvider>
    </>
  );
};
