import { createFrames } from "frames.js/next";
import { appURL } from "../../../utils";

type State = {
  transactionId: string;
};

export const frames = createFrames<State>({
  basePath: "/frames/home/frames",
  baseUrl: appURL(),
});