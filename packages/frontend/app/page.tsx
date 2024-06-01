export default function Home() {
    return (
        <div style={{ paddingTop: "33vh", textAlign: "center" }}>
            <h1>@farcaster/auth-kit + NextAuth</h1>
            <p>
            This example app shows how to use{" "}
            <a
                href="https://docs.farcaster.xyz/auth-kit/introduction"
                target="_blank" rel="noreferrer"
            >
                Farcaster AuthKit
            </a>{" "}
            and{" "}
            <a href="https://next-auth.js.org/" target="_blank" rel="noreferrer">
                NextAuth.js
            </a>
            .
            </p>
        
            <h2>Run this demo:</h2>
            <div
                style={{
                margin: "0 auto",
                padding: "24px",
                textAlign: "left",
                maxWidth: "640px",
                backgroundColor: "#fafafa",
                fontFamily: "monospace",
                fontSize: "1.25em",
                border: "1px solid #eaeaea",
                }}
            >
                git clone https://github.com/farcasterxyz/auth-monorepo.git &&
                <br />
                cd auth-monorepo/examples/with-next-auth &&
                <br />
                yarn install &&
                <br />
                yarn dev
            </div>      
        </div>  
    );
  }