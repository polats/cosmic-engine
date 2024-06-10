"use client";

import { LinkIcon, CircleStackIcon } from "@heroicons/react/24/outline";
import { useLocalStoragePreferences } from "~~/hooks/cosmic-engine";
import { useEffect, useState } from "react";

export const SwitchOffChain = ({ className }: { className?: string }) => {
  const { isOnchain, setIsOnchain } = useLocalStoragePreferences();
  const [mounted, setMounted] = useState(false);

  const handleToggle = () => {
    setIsOnchain(!isOnchain);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex space-x-2 h-8 items-center justify-center text-sm ${className}`}>
      <input
        id="theme-toggle"
        type="checkbox"
        className="toggle toggle-primary bg-primary hover:bg-primary border-primary"
        onChange={handleToggle}
        checked={isOnchain}        
      />
      <label htmlFor="theme-toggle" className={`swap swap-rotate ${!isOnchain ? "swap-active" : ""}`}>
        <LinkIcon className="swap-off h-5 w-5" />
        <CircleStackIcon className="swap-on h-5 w-5" />
        {
          isOnchain ? "Onchain" : "DB"
        }
      </label>
    </div>
  );
};
