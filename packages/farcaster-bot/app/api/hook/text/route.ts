import { Client } from "@gradio/client";
import neynarClient from "../../../../utils/neynarClient";

export async function POST(req: Request) {
  console.log("Receiving webhook....")
  try {
    const body = await req.text();
    console.log(body)
    const hookData = JSON.parse(body);
    console.log(hookData.data.text);

    if (!process.env.SIGNER_UUID) {
      throw new Error("Make sure you set SIGNER_UUID in your .env file");
    }

    // gradio client
    const gradioClient = await Client.connect(process.env.TTS_SERVER_ENDPOINT ?? '');
    const llmResult: any = await gradioClient.predict("/chat", [
            hookData.data.text.replace("@cosmobot", ""),
            ""
      ]);
    console.log(llmResult.data[0]);

    const reply = await neynarClient.publishCast(
      process.env.SIGNER_UUID,
      llmResult.data[0],
      {
        replyTo: hookData.data.hash,
      }
    );

    return new Response(`Replied to the cast with hash: ${reply.hash}`);
  } catch (e: any) {
    console.log(e.message, { status: 500 })
    return new Response(e.message, { status: 500 });
  }
}