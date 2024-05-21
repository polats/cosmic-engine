/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";

const BLOCK_EXPORER_URL = "http://localhost:3001/blockexplorer/transaction/";
const NEXT_PUBLIC_HOST = process.env.NEXT_PUBLIC_HOST;

const handleRequest = frames(async (ctx) => {

  // startBlock means transaction was sent
  const startBlock = ctx.searchParams.startBlock ?? ctx.state.startBlock;
  const fromAddress = ctx.searchParams.fromAddress ?? ctx.state.fromAddress;

  // retrieve middleware results
  const currentBlock = ctx.currentBlock;
  const blocksToAct = ctx.blocksToAct;
  const outcome = ctx.outcome;
  const callResult = ctx.callResult;
  
  console.log("startBlock", startBlock);
  console.log("currentBlock", currentBlock);
  console.log("blocksToAct", blocksToAct);
  console.log("outcome", outcome);



  if (startBlock) {
    return {
      image: NEXT_PUBLIC_HOST + "/loading.gif",
      imageOptions: {
        aspectRatio: "1.91:1",
      },
      textInput: callResult,
      buttons: [
        <Button
          action="post"
        >
          Refresh
        </Button>,
      ],
      state: {
        startBlock,
        fromAddress
      }
    };
  }

  return {
    image: (
      <div tw="bg-purple-800 text-white w-full h-full justify-center items-center">
       Retry Roll
      </div>
    ),
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      <Button action="tx" target="/txdata" post_url="/">
        Roll
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
