import Head from "next/head";
import NavigationBar from '~~/components/cosmic-engine/NavigationBar';
import { Suspense } from 'react';
import { JackpotJunction } from '~~/components/cosmic-engine'
interface SearchPageProps {
  children: React.ReactNode,
  searchParams: {
    tab: string;
  }
}

export default function Home({children, searchParams}: SearchPageProps) {
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
          { tab === 'wagon' ?
            <div>Wagon</div>
          : tab === 'market' ?
            <div>Market</div>
          : <Suspense>
              <JackpotJunction />
            </Suspense>
          }
        </div>
        <NavigationBar searchParams={searchParams ? searchParams : null} />
      </main>
    </>
  );
}
