import { useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

/**
 * Connects with drizzle and creates a new account if one does not exist.
 */
export function useLocalStoragePreferences() {

    const preferencesStorageKey = "cosmicengine.preferences.sk";
    const [isOnchain, setIsOnchain] = useLocalStorage<boolean>(preferencesStorageKey, true, {
      initializeWithValue: true,
    });

    const readLocalStorage = async () => {


    }

    useEffect(() => {
        readLocalStorage();
    }, []);

    return {
        isOnchain,
        setIsOnchain
    }
}
