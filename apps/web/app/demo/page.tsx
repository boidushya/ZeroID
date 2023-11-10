"use client";

import { useState } from "react";
import ZeroIDVerifier from "@/app/ZeroIDVerifier";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative bg-black bg-demo">
      <nav className="absolute top-0 left-0 w-full p-4 text-xl text-stone-200 font-bold flex items-center justify-between">
        ACME Inc.
        <button
          className="btn !flex items-center gap-2 !px-2"
          onClick={
            isVisible ? () => setIsVisible(false) : () => setIsVisible(true)
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <span>Verify Identity</span>
        </button>
      </nav>
      {<ZeroIDVerifier isVisible={isVisible} />}
    </main>
  );
}
