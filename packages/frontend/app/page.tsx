import Head from "next/head";
import { Suspense } from 'react';
import NavigationBar from '~~/components/cosmic-engine/Navigation/NavigationBar';
import NavigationContent from '~~/components/cosmic-engine/Navigation/NavigationContent';
interface SearchPageProps {
  searchParams: {
    tab: string | null;
  }
}

export default function Home({searchParams}: SearchPageProps) {
  const { tab } = searchParams;

  return (
    <>
      <Head>
        <title>Farcaster AuthKit + NextAuth Demo</title>
      </Head>
      <main 
        className="flex flex-col grow relative" 
        style={{ 
          fontFamily: "Inter, sans-serif",
          background: "linear-gradient(0deg, #C30B9C 0%, #569FBF 63%, #95C7DD 100%)"
        }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `url(/line-bg.png)`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          backgroundPosition: "center",
          opacity: 0.1}}
        ></div>
        <div className="relative z-[10] flex flex-col grow ">
          <NavigationContent tab={tab}/>
        </div>
        <NavigationBar searchParams={searchParams ??{tab: null}} />
      </main>
    </>
  );
}
