'use client';

import "@farcaster/auth-kit/styles.css";
import { useState, useEffect, useReducer } from 'react';
import { GameAccountDisplay } from "~~/components/cosmic-engine";
import AcceptButton from "~~/components/cosmic-engine/AcceptButton";
import RollButton from "~~/components/cosmic-engine/RollButton";
import { ReadContractDisplay } from "~~/components/cosmic-engine/ReadContractDisplay";

import { 
    JJ_CONTRACT_NAME, 
    ROLL_COST,
    ITEM_ID_IMAGE_LAYER_NAMES
    } from "@/lib/constants";

import { JackpotWheel } from "~~/components/cosmic-engine/JackpotWheel";
import { performRoll } from "@/lib/actions"
import { useAccount } from "wagmi"
import { useGlobalState } from "~~/services/store/store"
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAnimationConfig } from "~~/hooks/scaffold-eth";

// TODO: adjust types below when prizes are defined
export interface Prize {
    prizeType: string;
    prizeValue: string;
}

export interface PrizePool {
    prizes: Prize[];
    jackpotPrize?: Prize | null;
    lowestPrize?: Prize | null;
    mediumPrize?: Prize | null;
}

import { useLocalStoragePreferences } from "@/hooks/cosmic-engine";

export const JackpotJunction = () => {
    const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
    const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(JJ_CONTRACT_NAME);

    const [error, setError] = useState(false);
    const { address } = useAccount();
    const [ loading, setLoading ] = useState(false);
    const { isOnchain } = useLocalStoragePreferences();
    const [ isReroll, setIsReroll ] = useState(false);
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

    const [ bonus, setBonus ] = useState(false);
    const { data: outcome } = useScaffoldReadContract({
        contractName: JJ_CONTRACT_NAME,
        functionName: "outcome",
        args: [address, bonus]
    });

    useEffect(() => {
        if(!outcome){
            setPrizeWon(null);
        } else {
            if(isSpinning){
                const outcomeIndex = outcome[1].toString();
                const outcomeValue = outcome[2].toString();
                setPrizeWon({
                    prizeType: outcomeIndex,
                    prizeValue: outcomeValue
                });
                handleReroll(true);
            }
        }
    }, [outcome]);

    const { showAnimation } = useAnimationConfig(outcome);

    const handleIsSpinning = (val : boolean) => {
        setIsSpinning(val);
    }

    const handlePrizeWon = (prize: Prize | null) => {
        setPrizeWon(prize);
    }

    const handleReroll = (val: boolean) => {
        setIsReroll(val);
    }

    const handleLoading = (val: boolean) => {
        setLoading(val);
    }

    async function handleRoll() {
        if (!address) return;
        setIsSpinning(true);
        setLoading(true);
        await performRoll(address);
        setUserCurrency(userCurrency - 100);
        await new Promise(resolve => setTimeout(resolve,2500));
        setIsSpinning(false);
    }

    const outcomeResult = () => {
        if (!outcome) return null;

        const outcomeIndex = outcome[1].toString();
        const outcomeValue = outcome[2].toString();
        let outcomeString;

        switch (outcomeIndex) {
            case "0":
                outcomeString = "No prize, try again!";
                break;
            case "1":
                outcomeString = `You got ${ITEM_ID_IMAGE_LAYER_NAMES[parseInt(outcomeValue)][1]} ! Press ACCEPT to claim your prize!`;
                break;
            case "2":
                outcomeString = `Consolation Prize: ${outcomeValue} wei ! Press ACCEPT to claim your prize!`;
                break;
            case "3":
                outcomeString = `Moderate Prize: ${outcomeValue} wei ! Press ACCEPT to claim your prize!`;
                break;
            case "4":
                outcomeString = `JACKPOT: ${outcomeValue} wei ! Press ACCEPT to claim your prize!`;
                break;
            
        }


        return <div>{outcomeString}</div>
        
    }

    return (
        <div className="page-container">
 
            <div className="flex flex-col justify-center items-center min-h-[100%] text-center">
                {/* TODO: Add array for prize pool to make wheel dynamic  */}
                <div className="h-full w-full grow overflow-hidden flex justify-center items-center pt-[5rem] mb-2" >
                    <JackpotWheel 
                        prizePool={prizePool} 
                        prizeWon={prizeWon}
                        isSpinning={isSpinning}
                        handleLoading={handleLoading}
                        deployedContractData={deployedContractData ?? null}
                        handlePrizeWon={handlePrizeWon}
                        handleReroll={handleReroll}
                        handleIsSpinning={handleIsSpinning}
                    />
                </div>
                { 
                    deployedContractData &&

                    <div>
                        <div className="flex flex-col justify-center items-center grow-0 text-center">
                        {
                            (isOnchain) ? 
                                <>  
                                    <RollButton
                                        isReroll={isReroll}
                                        handleReroll={handleReroll}
                                        deployedContractData={deployedContractData}
                                        handlePrizeWon={handlePrizeWon}  
                                        handleLoading={handleLoading}        
                                        buttonLabel="SPIN"
                                        handleIsSpinning={handleIsSpinning}
                                        outcome={outcome}
                                        loading={loading}
                                        payableValue={ROLL_COST} // TODO: get ROLL_COST from contract
                                        onChange={() => {}}
                                    />
                                    {/* {
                                        outcome && outcome[1].toString() !== "0" &&
                                        <AcceptButton // TODO: implement DB version
                                            deployedContractData={deployedContractData}
                                        />
                                    } */}
                                    <div
                                        className={`mt-[1rem] break-all block transition bg-transparent ${
                                        showAnimation ? "bg-warning rounded-sm animate-pulse-fast" : ""
                                        }`}
                                    >
                                    {                                 
                                        outcomeResult()
                                    }            
                                    </div>
                                </>
                            :                
                                <button
                                    disabled={(userCurrency <= 0) || loading}
                                    className="spin w-[150px] h-[64px] text-xl text-center mb-[2.25rem]"
                                    onClick={handleRoll}
                                >
                                    {loading ? <span className="loading loading-spinner loading-xs"></span> : isReroll && prizeWon ? 'REROLL' : 'SPIN'}
                                </button>                      
                        }
                        </div>


                        <div className="bg-base-300 rounded-3xl px-6 lg:px-8 py-4 shadow-lg shadow-base-300">
                            {
                                deployedContractData &&
                                <ReadContractDisplay
                                fnName={"outcome"}
                                args={[address, false]}
                                refreshDisplayVariables={refreshDisplayVariables}
                                deployedContractData={deployedContractData}
                                />
                            }
                        </div>        
                    </div>                         
                }
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
