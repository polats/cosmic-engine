/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";

const BLOCK_EXPORER_URL = "http://localhost:3001/blockexplorer/transaction/";
const NEXT_PUBLIC_HOST = process.env.NEXT_PUBLIC_HOST;

const handleRequest = frames(async (ctx) => {

  // transactionId means transaction was sent
  const transactionId = ctx.searchParams.transactionId ?? ctx.state.transactionId;
  
  console.log(ctx.state);
  console.log(ctx.currentBlock);
  console.log(ctx.blocksToAct);

  if (transactionId) {
    return {
      image: NEXT_PUBLIC_HOST + "/loading.gif",
      imageOptions: {
        aspectRatio: "1.91:1",
      },
      buttons: [
        <Button
          action="post"
        >
          Refresh
        </Button>,
      ],
      state: {
        transactionId: transactionId
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
