import { createFrames } from "frames.js/next";
import { appURL } from "../../../utils";

type State = {
  transactionBlock: string;  
  transactionId: string;
  outcome: string;
  lastRollBlock: string;
};

export const frames = createFrames<State>({
  basePath: "/frames/post-roll/frames",
  baseUrl: appURL(),
});
