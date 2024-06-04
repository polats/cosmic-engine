import { useState, useEffect } from "react";
import { Address } from "viem";
import { toast } from 'react-hot-toast';
import { getUser } from "@/lib/data";
import { createUser } from "@/lib/actions";
/**
 * Connects with drizzle and creates a new account if one does not exist.
 */
export function useInitializeGameAccount(address: Address) {

    const INITIAL_AMOUNT = 10000;

    const [data, setData] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {

        if (!address) return;

        setIsLoading(true);

        try {
            const user = await getUser(address);

            if (user != null) {

                // retrieve user's currency
                if (user.currency != null)
                {
                    setData(user.currency.toString());
                }

            } else {

                // create new user
                await createUser(address);
                setData(INITIAL_AMOUNT.toString());
            }
        } catch (error:any) {
            console.log(error);
            setError(error);
        }
        setIsLoading(false);

    }

    useEffect(() => {
        fetchData();
    }, [address]);

    return {
        data,
        isLoading,
        error
    }
}
