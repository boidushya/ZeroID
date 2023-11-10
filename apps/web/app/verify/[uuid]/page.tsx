"use client";

import { useResizeObserver } from "@/hooks";
import downloadjs from "downloadjs";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import MIDVerifier from "@/app/MIDVerifier";

import QRCode from "@/components/QRCode";

import { copyToClipboard } from "@/utils/functions";

const containerAnimStates = {
  hidden: { opacity: 0, scale: 0.75, y: 50 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    y: 50,
    transition: {
      duration: 0.1,
    },
  },
};

const fetcher = async (...args: Parameters<typeof fetch>) => {
  const res = await fetch(...args);
  return res.json();
};

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);

  const onResize = useCallback((target: HTMLDivElement) => {
    if (ref.current) {
      ref.current.style.height = `${target.offsetHeight}px`;
    }
    console.log(`Change height to ${target.offsetHeight}px`);
  }, []);

  const contentRef = useResizeObserver(onResize);

  const [isVerified, setVerified] = useState(false);
  const { uuid } = useParams();

  const { data, isLoading } = useSWR(`/api/verifyZK/${uuid}`, fetcher);

  const qrRef = useRef<HTMLDivElement>(null);

  const onCopySuccess = useCallback(() => {
    toast.success("Unique ID copied", {
      description: "Share this with others to verify this person's identity",
    });
  }, []);

  useEffect(() => {
    if (data?.success) {
      setVerified(true);
    }
  }, [data]);

  const handleCaptureClick = async () => {
    const canvas = await html2canvas(ref.current as HTMLElement, {
      backgroundColor: null,
      onclone: data => {
        toast.success("Downloading image", {
          description: "Share this QR to verify your identity",
        });
      },
    });
    const dataURL = canvas.toDataURL("image/png");
    downloadjs(dataURL, "download.png", "image/png");
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative bg-black bg-demo">
      <nav className="absolute top-0 left-0 w-full p-4 text-xl text-stone-200 font-bold flex items-center justify-between">
        Mina ID Verifier POC
        <a
          href="https://github.com/boidushya/MID"
          target="_blank"
          className="btn !flex items-center gap-2"
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>GitHub</title>
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span>Source Code</span>
        </a>
      </nav>
      <AnimatePresence>
        <motion.div
          variants={containerAnimStates}
          initial="hidden"
          animate="show"
          exit="exit"
          ref={ref}
          className="transition-[height] bg-stone-950 shadow-2xl rounded-2xl relative overflow-hidden w-[24rem]"
        >
          <div ref={contentRef} className="p-6 ">
            <Toaster richColors />

            <div className="flex justify-between items-center mb-6">
              <h1 className="font-medium text-2xl text-stone-300">
                Verify Identity
              </h1>
              <p
                className="text-xs font-bold text-blue-900 bg-blue-400 rounded-full px-2 py-0.5 flex items-center gap-1 lock-anim whitespace-nowrap overflow-hidden relative bg-overlay"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-3 h-3 flex-shrink-0 lock-closed-anim"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-3 h-3 flex-shrink-0 lock-open-anim"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span>Secured by MID </span>
              </p>
            </div>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5 }}
                  key="loader"
                  className="flex items-center justify-between gap-2 text-stone-400"
                >
                  Attempting to verify identity <div className="loader"></div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5 }}
                  key="content"
                >
                  {isVerified ? (
                    <>
                      <div className="flex items-center gap-2 justify-between mb-6">
                        <p className="text-stone-400">Verification Status</p>
                        <p className="text-sm">
                          {isVerified ? (
                            <span className="bg-green-800/50 text-green-300 rounded-full flex items-center px-1.5 py-0.5 gap-1 font-semibold pr-2 text-sm">
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
                              Verified
                            </span>
                          ) : (
                            <span className="bg-red-800/50 text-red-200 rounded-full flex items-center px-1.5 py-0.5 gap-1 font-semibold pr-2 text-sm">
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
                                  d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
                                />
                              </svg>
                              Unverified
                            </span>
                          )}
                        </p>
                      </div>
                      <QRCode ref={qrRef} uri={`${URL}/verify/${uuid}`} />
                      <div className="mt-4 mb-2.5">
                        <span className="text-stone-400">Unique ID</span>
                        <div className="w-fit mt-1 flex items-center gap-1 justify-between">
                          <span className="bg-stone-800/80 text-stone-200 rounded-full flex items-center px-2.5 py-1 font-medium text-sm leading-tight">
                            {uuid}
                          </span>
                          <button
                            className="bg-stone-900 p-1.5 rounded-md text-stone-200 hover:bg-stone-700 hover:text-stone-100 transition-colors bg-overlay"
                            onClick={() => copyToClipboard(uuid, onCopySuccess)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-6 -mb-1">
                          <button
                            data-html2canvas-ignore
                            className="btn flex-1 w-full"
                            onClick={handleCaptureClick}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 justify-between mb-2">
                        <p className="text-stone-400">Verification Status</p>
                        <p className="text-sm">
                          <span className="bg-red-800/50 text-red-200 rounded-full flex items-center px-1.5 py-0.5 gap-1 font-semibold pr-2 text-sm">
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
                                d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
                              />
                            </svg>
                            Unverified
                          </span>
                        </p>
                      </div>
                      <p className="text-stone-400 mb-1.5">Error Log</p>
                      <p className="text-stone-200 text-sm">
                        <span className="text-stone-100 font-semibold">
                          {uuid}
                        </span>{" "}
                        could not be verified by ZeroID
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
