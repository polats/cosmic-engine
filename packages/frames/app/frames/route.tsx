/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";

const frameHandler = frames(async (ctx) => {
  return {
    image: (
      <div tw="flex flex-col">
        <div tw="flex">Intro Screen</div>
      </div>
    ),
    buttons: [
      <Button action="post" target={{ pathname: "/home" }}>
        Press Start
      </Button>
    ]
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
