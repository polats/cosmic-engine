import Head from "next/head";
import { JackpotJunction } from "~~/components/cosmic-engine/JackpotJunction";

export default function Home() {
  return (
    <>
      <Head>
        <title>Farcaster AuthKit + NextAuth Demo</title>
      </Head>
      <main className="flex flex-col grow" style={{ fontFamily: "Inter, sans-serif"}}>
        <JackpotJunction />
      </main>
    </>
  );
}
