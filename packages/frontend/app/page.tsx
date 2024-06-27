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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Playwrite+NZ:wght@100..400&display=swap" rel="stylesheet" />
      </Head>
      <main 
        className="h-full" 
        style={{ 
          fontFamily: "Inter, sans-serif",
          background: "linear-gradient(0deg, #C30B9C 0%, #569FBF 63%, #95C7DD 100%)"
        }}
      >
        <div className="absolute inset-0 z-[-1]" style={{
          backgroundImage: `url(/line-bg.png)`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          backgroundPosition: "center",
          opacity: 0.1}}
        ></div>
        <div className="flex flex-col h-full">
          <NavigationContent tab={tab}/>
          <div className="flex items-end">
            <NavigationBar searchParams={searchParams ??{tab: null}} />
          </div>
        </div>
      </main>
    </>
  );
}
