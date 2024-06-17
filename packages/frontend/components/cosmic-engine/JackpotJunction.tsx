'use client';

import "@farcaster/auth-kit/styles.css";
import { useState, useReducer } from 'react';
import { GameAccountDisplay } from "~~/components/cosmic-engine";

import { UniversalButton } from "~~/components/cosmic-engine/UniversalButton";
import { OutcomeDisplay } from "~~/components/cosmic-engine/OutcomeDisplay";

import { 
    Contract, 
    ContractName, 
    GenericContract, 
    InheritedFunctions 
    } from "~~/utils/scaffold-eth/contract";

import { ContractVariables } from "@/app/debug/_components/contract/ContractVariables";

import { 
    JJ_CONTRACT_NAME, 
    ROLL_COST
    } from "@/lib/constants";

import deployedContracts from "@/contracts/deployedContracts";
import { Abi, AbiFunction } from "abitype";

import { JackpotWheel } from "~~/components/cosmic-engine/JackpotWheel";
import { performRoll } from "@/lib/actions"
import { useAccount } from "wagmi"
import { useGlobalState } from "~~/services/store/store"
import { confetti } from "@tsparticles/confetti"

// TODO: adjust types below when prizes are defined
export interface Prize {
    prize: string;
}

export interface PrizePool {
    prizes: Prize[];
    jackpotPrize?: Prize | null;
    lowestPrize?: Prize | null;
    mediumPrize?: Prize | null;
}

import { useLocalStoragePreferences } from "@/hooks/cosmic-engine";

const deployedContractData = deployedContracts[31337].JackpotJunction;


export const JackpotJunction = () => {
    const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
    const [error, setError] = useState(false);
    const { address } = useAccount();
    const [ loading, setLoading ] = useState(false);
    const userCurrency = useGlobalState(({ userCurrency }) => userCurrency);
    const setUserCurrency = useGlobalState(({ setUserCurrency }) => setUserCurrency);
    const [ isSpinning, setIsSpinning ] = useState(false);
    const [ prizeWon, setPrizeWon ] = useState<Prize | null>(null);
    const [ prizePool, setPrizePool ] = useState<PrizePool>({
        prizes: [],
        jackpotPrize: null,
        lowestPrize: null,
        mediumPrize: null
    });
    const { isOnchain } = useLocalStoragePreferences();
    


    async function handleRoll() {
        if (!address) return;
        setIsSpinning(true);
        setLoading(true);
        await performRoll(address);
        setUserCurrency(userCurrency - 100);
        setLoading(false);
        await new Promise(resolve => setTimeout(resolve,2500));
        setIsSpinning(false);
        setPrizeWon({prize: 'This is the reward!'});
        
    }



    const rollFunction = (
        (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
      )
        .filter(fn => {
          const isWriteableFunction = fn.stateMutability !== "view" && fn.stateMutability !== "pure";
          return isWriteableFunction;
        })
        .filter(fn => fn.name == "roll")
        .map(fn => {
          return {
            fn,
            inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
          };
        })
    
      if (!rollFunction.length) {
        return <>No write methods</>;
      }

      const acceptFunction = (
        (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
      )
        .filter(fn => {
          const isWriteableFunction = fn.stateMutability !== "view" && fn.stateMutability !== "pure";
          return isWriteableFunction;
        })
        .filter(fn => fn.name == "accept")
        .map(fn => {
          return {
            fn,
            inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
          };
        })
    
      if (!rollFunction.length) {
        return <>No write methods</>;
      }

    return (
        <div className="page-container">
 
            <div className="flex flex-col justify-center items-center grow text-center">
                <GameAccountDisplay />
                {/* TODO: Add array for prize pool to make wheel dynamic  */}

                <JackpotWheel 
                    prizePool={prizePool} 
                    prizeWon={prizeWon}
                    isSpinning={isSpinning}
                />

                <div className="flex justify-center">
                {
                    (isOnchain) ? 
                    rollFunction.map(({ fn, inheritedFrom }, idx) => (                    
                <UniversalButton
                contractName={JJ_CONTRACT_NAME as ContractName}
                buttonLabel="Spin"
                payableValue={ROLL_COST} // TODO: get ROLL_COST from contract
                abi={deployedContractData.abi as Abi}
                key={`${fn.name}-${idx}}`}
                abiFunction={fn}
                onChange={() => {}}
                contractAddress={deployedContractData.address}
                />))
              :                
                    <button
                        disabled={(userCurrency <= 0) || loading}
                        className="bg-blue-600 hover:bg-blue-700 py-3 px-6 text-white rounded-lg"
                        onClick={handleRoll}
                    >
                        Spin
                    </button>                      
                }
                </div>

                {
                acceptFunction.map(({ fn, inheritedFrom }, idx) => (                    
                    <UniversalButton
                    contractName={JJ_CONTRACT_NAME as ContractName}
                    buttonLabel="Accept Prize"
                    abi={deployedContractData.abi as Abi}
                    key={`${fn.name}-${idx}}`}
                    abiFunction={fn}
                    onChange={() => {}}
                    contractAddress={deployedContractData.address}
                    />))    
                }

                <div className="bg-base-300 rounded-3xl px-6 lg:px-8 py-4 shadow-lg shadow-base-300">
                    <OutcomeDisplay
                    refreshDisplayVariables={refreshDisplayVariables}
                    deployedContractData={deployedContractData}
                    />
                </div>             
            </div>
        </div>
    );
};

/* auth UI

import { SignInButton, StatusAPIResponse } from "@farcaster/auth-kit";
import { signIn, signOut, getCsrfToken } from "next-auth/react";
import { usePrivy } from "@privy-io/react-auth";
import { Profile } from "~~/components/cosmic-engine/Profile";

    const { ready, authenticated, user, login, logout } = usePrivy();   


    const getNonce = useCallback(async () => {
        const nonce = await getCsrfToken();
        if (!nonce) throw new Error("Unable to generate nonce");
        return nonce;
    }, []);

    const handleSuccess = useCallback(
        (res: StatusAPIResponse) => {
            signIn("credentials", {
                message: res.message,
                signature: res.signature,
                name: res.username,
                pfp: res.pfpUrl,
                redirect: false,
            });
    }, []);

            <div style={{ position: "fixed", top: "80px", right: "12px" }}>
                <SignInButton
                    nonce={getNonce}
                    onSuccess={handleSuccess}
                    onError={() => setError(true)}
                    onSignOut={() => signOut()}
                />
                {error && <div>Unable to sign in at this time.</div>}
            </div>
            <div style={{ position: "fixed", top: "140px", right: "12px" }}>
                {
                ready && authenticated ? 
                    <button
                        onClick={logout}
                        className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
                    >
                        Logout
                    </button>     
                :
                <button
                    className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
                    onClick={login}
                >
                    Privy Login
                </button>                    
                }
            </div>  
            <Profile />
*/
