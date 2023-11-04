"use client";

import type { NextPage } from "next";
import { FormEvent, useCallback, useRef, useState } from "react";
import { useGlobalStore } from "@/contexts";
import OTPInput from "react-otp-input";
import { AnimatePresence, motion } from "framer-motion";
import { useResizeObserver } from "@/hooks";
import QRCode from "@/components/QRCode";
import { copyToClipboard, truncate } from "@/utils/functions";
import { Toaster, toast } from "sonner";
import html2canvas from "html2canvas";
import downloadjs from "downloadjs";

const URL = "https://mid-lake.vercel.app";

const screenAnimStates = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -150,
  },
};

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

const ScreenDiv = ({ children, ...props }) => (
  <motion.div
    variants={screenAnimStates}
    initial="hidden"
    animate="show"
    exit="exit"
    {...props}
  >
    {children}
  </motion.div>
);

const FirstScreen = () => {
  const [error, setError] = useState("");
  const { aadhar, setAadhar, incrementScreen } = useGlobalStore();
  const [aadharInput, setAadharInput] = useState(aadhar);
  const validateAadhar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/validateAadhar", {
        method: "POST",
        body: JSON.stringify({ aadhar: aadharInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAadhar(aadharInput);
        incrementScreen();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };
  return (
    <ScreenDiv key="first">
      <form onSubmit={validateAadhar} className="grid gap-3">
        <div>
          <p className="text-stone-300 mb-1">Aadhar Number</p>
          <p className="text-stone-500 text-xs mb-4">
            Enter your 12 digit aadhar number without spaces
          </p>
          <input
            type="text"
            value={aadharInput}
            autoFocus
            className={` flex-1 w-full border-2 border-stone-900 placeholder:font-sans font-mono px-2 py-1 rounded-md shadow-md bg-transparent text-stone-200 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500/50 ${
              error !== "" && "!border-red-400/25"
            }`}
            onChange={(e) => setAadharInput(e.target.value)}
            placeholder="e.g. 123412341234"
          />
        </div>
        <p className="text-red-400 text-sm">{error}</p>
        <button className="btn" type="submit">
          Next
        </button>
      </form>
    </ScreenDiv>
  );
};

const SecondScreen = () => {
  const [error, setError] = useState("");

  const {
    aadhar,
    decrementScreen,
    incrementScreen,
    setIsVerified,
    setDetails,
  } = useGlobalStore();

  const [otpInput, setOtpInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateOTP = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const res = await fetch("/api/validateOTP", {
          method: "POST",
          body: JSON.stringify({ OTP: otpInput, aadhar }),
        });
        const data = await res.json();
        setIsLoading(false);
        if (res.ok) {
          setIsVerified(true);
          setDetails(data);
          incrementScreen();
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      }
    }, 2000);
  };
  return (
    <ScreenDiv key="second">
      <AnimatePresence initial={false}>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between gap-2 text-stone-400"
          >
            Authenticating with Aadhar <div className="loader"></div>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={validateOTP}
            className="grid gap-3"
          >
            <div className="">
              <p className="text-stone-300 mb-1">OTP</p>
              <p className="text-stone-500 text-xs mb-4">
                Check your registered mobile number for OTP
              </p>
              <OTPInput
                value={otpInput}
                onChange={setOtpInput}
                numInputs={6}
                shouldAutoFocus={true}
                renderSeparator={<span className="flex-1"></span>}
                renderInput={(props) => (
                  <input
                    {...props}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    type="text"
                    className="!w-12 !h-12 rounded-md bg-transparent transition-colors border-2 border-stone-900 focus:outline-none focus:border-stone-700 duration-100"
                  />
                )}
              />
            </div>
            <p className="text-red-400 text-sm">{error}</p>
            <div className="flex w-full gap-2">
              <button className="btn flex-1 order-2" type="submit">
                Next
              </button>
              <button
                className="btn btn-secondary flex-1 order-1"
                onClick={(e) => {
                  e.preventDefault();
                  decrementScreen();
                }}
              >
                Back
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </ScreenDiv>
  );
};

const ThirdScreen = () => {
  const { isVerified, decrementScreen, resetScreen, details } =
    useGlobalStore();

  const ref = useRef<HTMLDivElement>(null);

  const onCopySuccess = useCallback(() => {
    toast.success("Unique ID copied", {
      description: "Share this with others to verify your identity",
    });
  }, []);
  const handleCaptureClick = async () => {
    const canvas = await html2canvas(ref.current as HTMLElement, {
      backgroundColor: null,
      onclone: (data) => {
        toast.success("Downloading image", {
          description: "Share this QR to verify your identity",
        });
      },
    });
    const dataURL = canvas.toDataURL("image/png");
    downloadjs(dataURL, "download.png", "image/png");
  };
  return (
    <ScreenDiv key="third">
      {isVerified && (
        <div className="w-full">
          {/* <div className="avatar mx-auto mb-8" /> */}
          <QRCode ref={ref} uri={`${URL}/verify/${details.uuid}`} />
          <div className="flex items-center justify-between mt-6 mb-2.5">
            <span className="text-stone-400">Unique ID</span>
            <div className="flex items-center justify-center gap-1">
              <span className="bg-stone-800/80 text-stone-200 rounded-full flex items-center px-2.5 py-1 font-medium text-sm leading-tight">
                {truncate(details.uuid)}
              </span>
              <button
                className="bg-stone-900 p-1.5 rounded-md text-stone-200 hover:bg-stone-700 hover:text-stone-100 transition-colors bg-overlay"
                onClick={() => copyToClipboard(details.uuid, onCopySuccess)}
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
            {/* <span className="">{truncate(details.uuid)}</span> */}
          </div>
          <div className="flex items-center gap-2 justify-between mb-4">
            <p className="text-stone-400">Verification Status</p>
            <p
              className={
                isVerified ? "text-green-400 text-sm" : "text-red-400 text-sm"
              }
            >
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
                <span className="bg-yellow-800/50 text-yellow-300 rounded-full flex items-center px-1.5 py-0.5 gap-1 font-semibold pr-2 text-sm">
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
          <div className="mt-6">
            <button
              data-html2canvas-ignore
              className="btn flex-1 w-full"
              onClick={handleCaptureClick}
            >
              Download
            </button>
          </div>
        </div>
      )}
      <div className="flex w-full gap-2">
        {!isVerified && (
          <>
            <button
              className="btn btn-secondary flex-1"
              onClick={decrementScreen}
            >
              Back
            </button>
            <button className="btn flex-1" onClick={resetScreen}>
              Try Again
            </button>
          </>
        )}
      </div>
    </ScreenDiv>
  );
};

const MIDVerifier: NextPage<{ isVisible?: boolean }> = ({
  isVisible = true,
}) => {
  const { currentScreen } = useGlobalStore();

  const ref = useRef<HTMLDivElement>(null);

  const onResize = useCallback((target: HTMLDivElement) => {
    if (ref.current) {
      ref.current.style.height = `${target.offsetHeight}px`;
    }
    console.log(`Change height to ${target.offsetHeight}px`);
  }, []);

  const contentRef = useResizeObserver(onResize);
  return (
    <AnimatePresence>
      {isVisible && (
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
              <h1 className="font-medium text-2xl text-stone-300">Identity</h1>
              <p
                data-html2canvas-ignore
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
              {currentScreen === 0 && <FirstScreen key="0" />}
              {currentScreen === 1 && <SecondScreen key="1" />}
              {currentScreen === 2 && <ThirdScreen key="2" />}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MIDVerifier;
