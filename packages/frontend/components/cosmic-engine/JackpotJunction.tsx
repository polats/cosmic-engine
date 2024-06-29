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
import {    
    useDeployedContractInfo, 
    useScaffoldReadContract,
    useAnimationConfig
 } from "~~/hooks/scaffold-eth";

import { JackpotBalance } from "./JackpotBalance";
import { MediumJackpotBalance } from "./MediumJackpotBalance";

 
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
import { useBlockNumber } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const JackpotJunction = () => {
    // press ` to toggle cosmic console
    const cosmicConsole = useGlobalState(state => state.cosmicConsole);

    const { targetNetwork } = useTargetNetwork();

    const [ wheelState, setWheelState ] = useState('notMoving');
    const [ isWheelActive, setIsWheelActive ] = useState(false);
    const [ prizeWon, setPrizeWon ] = useState<Prize | null>(null);
    const [ isReroll, setIsReroll ] = useState(false);

    const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
    const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(JJ_CONTRACT_NAME);
    const [error, setError] = useState(false);
    const { address } = useAccount();
    const [ loading, setLoading ] = useState(false);
    const { isOnchain } = useLocalStoragePreferences();
    const userCurrency = useGlobalState(({ userCurrency }) => userCurrency);
    const setUserCurrency = useGlobalState(({ setUserCurrency }) => setUserCurrency);
    const [ isSpinning, setIsSpinning ] = useState(false);
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
            if(isWheelActive){
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

    const { data: blockNumber } = useBlockNumber({ watch: true })

    useEffect(() => {
        // new block
        // console.log(blockNumber);
      }, [blockNumber])

    const { showAnimation } = useAnimationConfig(outcome);

    const handleWheelActivity = (val: boolean) => {
        setIsWheelActive(val);
    }

    const handleWheelState = (val: string) => {
        setWheelState(val);
    }

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
        
        {
            // cosmicConsole && 
            deployedContractData && 
                <div className="flex flex-row justify-center items-center grow-0 text-center pb-[3rem] lg:mb-[1rem] 3xl:mb-[5rem]">
                    <span className="font-bold text-sm ">Small Prize:</span>
                    <div className="px-5">{Number(ROLL_COST)*1.5}</div>
                    <span className="font-bold text-sm">Jackpot:</span>
                    <JackpotBalance address={deployedContractData.address} className="px-5 h-5 min-h-[0.375rem]" />
                    <span className="font-bold text-sm">Medium Prize:</span>
                    <MediumJackpotBalance address={deployedContractData.address} className="px-0 h-5 min-h-[0.375rem]" />                    
                    <span className="font-bold text-sm px-5">Current Block:</span>
                    <div className="px-5">{blockNumber?.toString()}</div>
                    
                </div>               

        }

            <div className="flex flex-col justify-center items-center h-full min-h-[100%] text-center">
                <div className="flex justify-center items-center mb-2
                    h-[400px] w-[300px] xs:h-[560px] xs:w-[455px] lg:h-[700px] lg:w-[600px] 3xl:w-[950px] 3xl:h-[950px] 4xl:w-[1500px] 4xl:h-[1500px]
                " >
                    <JackpotWheel 
                        wheelState={wheelState}
                        isWheelActive={isWheelActive}
                        prizeWon={prizeWon}
                        isReroll={isReroll}
                        prizeSmall={Number(ROLL_COST)*1.5}
                        handleWheelActivity={handleWheelActivity}
                        handleWheelState={handleWheelState}
                        handlePrizeWon={handlePrizeWon}
                        handleReroll={handleReroll}
                        handleLoading={handleLoading}
                        deployedContractData={deployedContractData ?? null}
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
                                        isWheelActive={isWheelActive}
                                        isReroll={isReroll}
                                        handleReroll={handleReroll}
                                        deployedContractData={deployedContractData}
                                        handlePrizeWon={handlePrizeWon}  
                                        handleLoading={handleLoading}
                                        buttonLabel="SPIN"
                                        triggerRefreshDisplayVariables={triggerRefreshDisplayVariables}
                                        handleIsSpinning={handleIsSpinning}
                                        handleWheelActivity={handleWheelActivity}
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
                                        cosmicConsole && outcomeResult()
                                    }            
                                    </div>
                                </>
                            :                
                                <button
                                    disabled={(userCurrency <= 0) || loading}
                                    className="spin w-[150px] h-[64px] text-xl text-center mb-[2.25rem]"
                                    onClick={handleRoll}
                                >
                                    {loading ? <span className="loading loading-spinner loading-xs"></span> : isReroll && prizeWon ? 'RESPIN' : 'SPIN'}
                                </button>                      
                        }
                        </div>

                        {
                            cosmicConsole && 
                            <>
                                {wheelState}

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
                            </>
                        }
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
