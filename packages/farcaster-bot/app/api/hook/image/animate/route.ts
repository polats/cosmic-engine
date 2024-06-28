import { NeynarFrameCreationRequest } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import neynarClient from "../../../../../utils/neynarClient";
import { ImageToVideoHelperService } from "../../../../../utils/comfyuiHelper";

const comfyuiClient = new ImageToVideoHelperService(process.env.SVD_SERVER_ENDPOINT ?? '');
let intervalId: any;

export async function POST(req: Request) {
  console.log("Receiving webhook....")
  try {
    const body = await req.text();
    console.log(body);
    const hookData = JSON.parse(body);
    console.log(hookData.data.text);

    if (!process.env.SIGNER_UUID) {
      throw new Error("Make sure you set SIGNER_UUID in your .env file");
    }

    const gifPromptId = await comfyuiClient.promptImageToVideo(
      hookData.data.embeds[0].url,
      'GIF',
      1,
      "2D",
    );

    console.log("PROMPT FINISHED: " + gifPromptId);
    
    intervalId = setInterval(checkGenerationResult, 15000, gifPromptId, hookData)

    const reply = await neynarClient.publishCast(
      process.env.SIGNER_UUID ?? '',
      "Now sparking your image, please wait… ⏳",
      {
        replyTo: hookData.data.hash,
        embeds: []
      }
    );
    console.log(`Replied to the cast with hash: ${reply.hash}`)

    return new Response(`Finished, waiting for promt to finish`);
  } catch (e: any) {
    console.log(e.message, { status: 500 })
    return new Response(e.message, { status: 500 });
  }
}

async function checkGenerationResult(promptId: string, hookData: any) {
  console.log('checking result of: '+ promptId)
  const result = await comfyuiClient.getVideoPromptResponse(promptId)

  console.log(result)
  if (result.status === 'success'){
    console.log('generation success: ' + result.data)
    clearInterval(intervalId)
    console.log('sending cast reply with image')

    const creationRequest: NeynarFrameCreationRequest = {
      name: `sparked image ${hookData.data.author.username}`,
      pages: [
        {
          image: {
            url: result.data[0],
            aspect_ratio: "1:1",
          },
          title: "Sparked Image",
          buttons: [],
          input: {
            text: {
              enabled: false,
            },
          },
          uuid: "spark",
          version: "vNext",
        },
      ],
    };
    const frame = await neynarClient.publishNeynarFrame(creationRequest);
    const reply = await neynarClient.publishCast(
      process.env.SIGNER_UUID ?? '',
      "Sparked",
      {
        replyTo: hookData.data.hash,
        embeds: [
          {
            url: frame.link
          }
        ]
      }
    );
    console.log(`Replied to the cast with hash: ${reply.hash}`)
  }
}

export async function GET() {
  console.log("get received")
  return new Response("nice one", {status: 200})
}