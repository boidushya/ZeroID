"use client";

import { FormEvent, useState } from "react";
import { useGlobalStore } from "./contexts";
import OTPInput from "react-otp-input";

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
    <form onSubmit={validateAadhar} className="grid gap-3">
      <div className="flex gap-4 items-center">
        <label className="text-stone-400">Aadhar Number</label>
        <input
          type="text"
          value={aadharInput}
          className={` flex-1 border-2 text-sm border-stone-900 placeholder:font-sans font-mono px-2 py-1 rounded-md shadow-md bg-transparent text-stone-200 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500/50 ${
            error !== "" && "!border-red-400/25"
          }`}
          onChange={(e) => setAadharInput(e.target.value)}
          placeholder="Enter 12 digit aadhar number"
        />
      </div>
      <p className="text-red-400 text-sm">{error}</p>
      <button className="btn" type="submit">
        Next
      </button>
    </form>
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
    }, 5000);
  };
  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-between gap-2 text-stone-400">
          Authenticating with Aadhar <div className="loader"></div>
        </div>
      ) : (
        <form onSubmit={validateOTP} className="grid gap-3">
          <div className="">
            <p className="text-stone-300 mb-0.5">OTP</p>
            <p className="text-stone-500 text-xs mb-4">
              Check your registered mobile number for OTP
            </p>
            <OTPInput
              value={otpInput}
              onChange={setOtpInput}
              numInputs={6}
              renderSeparator={<span className="flex-1"></span>}
              renderInput={(props) => (
                <input
                  {...props}
                  className="!w-12 !h-12 rounded-md bg-transparent border-2 border-stone-900"
                />
              )}
            />
          </div>
          <p className="text-red-400 text-sm">{error}</p>
          <div className="flex w-full gap-2">
            <button
              className="btn btn-secondary flex-1"
              onClick={decrementScreen}
            >
              Back
            </button>
            <button className="btn flex-1" type="submit">
              Next
            </button>
          </div>
        </form>
      )}
    </>
  );
};

const ThirdScreen = () => {
  const { isVerified, decrementScreen, resetScreen, details } =
    useGlobalStore();
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 justify-between mb-4">
        <p className="text-stone-300">Verification Status</p>
        <p
          className={
            isVerified ? "text-green-400 text-sm" : "text-red-400 text-sm"
          }
        >
          {isVerified ? (
            <div className="bg-green-800/50 text-green-300 rounded-full flex items-center px-1.5 py-0.5 gap-1 font-semibold pr-2 text-sm">
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
            </div>
          ) : (
            <div className="bg-yellow-800/50 text-yellow-300 rounded-full flex items-center px-1.5 py-0.5 gap-1 font-semibold pr-2 text-sm">
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
            </div>
          )}
        </p>
      </div>
      {isVerified && (
        <div className="w-full">
          <div className="avatar mx-auto mb-8" />
          <p className="flex items-center justify-between">
            <span className="text-stone-500">Name</span>
            {details.name}
          </p>
          <p className="flex items-center justify-between">
            <span className="text-stone-500">Date of Birth</span>
            {details.dob}
          </p>
          <a
            className="mt-8 -mb-2 text-center block text-xs text-stone-600 hover:underline underline-offset-1"
            href="https://minascan.io/"
            target="_blank"
          >
            Verify identity on MinaScan
          </a>
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
    </div>
  );
};

const Screen = () => {
  const { currentScreen } = useGlobalStore();
  switch (currentScreen) {
    case 0:
      return <FirstScreen />;
    case 1:
      return <SecondScreen />;
    case 2:
      return <ThirdScreen />;
    default:
      return <div>Something went wrong</div>;
  }
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative">
      <nav className="absolute top-0 left-0 w-full p-4 text-xl text-stone-200 font-bold flex items-center justify-between">
        Mina ID POC
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
      <div className="p-6 shadow-2xl rounded-2xl bg-stone-950 relative overflow-hidden w-[24rem]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-medium text-2xl text-stone-300">Identity</h1>
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
        <Screen />
      </div>
    </main>
  );
}
