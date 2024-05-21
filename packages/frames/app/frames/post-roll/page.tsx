import Link from "next/link";
import { currentURL, appURL } from "../../utils";
import { createDebugUrl } from "../../debug";
import type { Metadata } from "next";
import { fetchMetadata } from "frames.js/next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Call Roll page",
    description: "Calls a roll function in the smart contract",
    other: {
      ...(await fetchMetadata(
        new URL("/frames/post-roll/frames", appURL())
      )),
    },
  };
}

export default async function Home() {
  const url = currentURL("/frames/post-roll");

  return (
    <div>
      Post Roll Page{" "}
      <Link href={createDebugUrl(url)} className="underline">
        Debug
      </Link>
    </div>
  );
}
