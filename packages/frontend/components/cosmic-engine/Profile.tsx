'use client';

import { useSession, signOut } from "next-auth/react";

export const Profile = () => {
    const { data: session } = useSession();
  
    return session ? (
      <div style={{ fontFamily: "sans-serif" }}>
        <p>Signed in as {session.user?.name}</p>
        <p>
          <button
            type="button"
            style={{ padding: "6px 12px", cursor: "pointer" }}
            onClick={() => signOut()}
          >
            Click here to sign out
          </button>
        </p>
      </div>
    ) : (
      <p>
        FC Sign in info appears here
      </p>
    );
  }
  