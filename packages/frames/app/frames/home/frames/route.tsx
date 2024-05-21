/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";
import { getTransactionDetails } from "../../../utils";

const BLOCK_EXPORER_URL = "http://localhost:3001/blockexplorer/transaction/";
const NEXT_PUBLIC_HOST = process.env.NEXT_PUBLIC_HOST;

const handleRequest = frames(async (ctx) => {

  // transactionId means transaction was sent
  if (ctx.message?.transactionId) {

    const transactionId : any = ctx.message.transactionId;
    const transaction = await getTransactionDetails(transactionId);
    const startBlock = transaction.blockNumber.toString();
    const fromAddress = transaction.from;

    const message:any = {
      ...ctx.message,
      startBlock,
      fromAddress
    }

    return {
      image: NEXT_PUBLIC_HOST + "/loading.gif",
      imageOptions: {
        aspectRatio: "1.91:1",
      },
      buttons: [
        <Button
          action="post"
          target={{pathname: "/post-roll", query: message}}
        >
          Refresh
        </Button>,
        <Button
          action="link"
          target={BLOCK_EXPORER_URL + ctx.message.transactionId}
        >
          View on block explorer
        </Button>,
      ]
    };
  }

  return {
    image: (
      <div tw="bg-purple-800 text-white w-full h-full justify-center items-center">
       Call Roll
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
