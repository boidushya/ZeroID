import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_SCREEN = 3;

interface AadharState {
  aadhar: string;
  aadharValid: boolean;
  currentScreen: number;
  isVerified: boolean;
  details: {
    name: string;
    dob: string;
    aadhar: string;
    uuid: string;
  };
  setAadhar: (newAadhar: string) => void;
  setAadharValid: (isValid: boolean) => void;
  setIsVerified: (isVerified: boolean) => void;
  setDetails: (details: AadharState["details"]) => void;
  incrementScreen: () => void;
  decrementScreen: () => void;
  resetScreen: () => void;
}

export const useGlobalStore = create<AadharState>()(
  persist(
    (set) => ({
      aadhar: "",
      aadharValid: false,
      currentScreen: 0,
      isVerified: false,
      details: {
        name: "",
        dob: "",
        aadhar: "",
        uuid: "",
      },
      setDetails: (details) => set(() => ({ details })),
      incrementScreen: () =>
        set((state) => ({
          currentScreen:
            state.currentScreen + 1 > MAX_SCREEN
              ? MAX_SCREEN
              : state.currentScreen + 1,
        })),
      setIsVerified: (isVerified) => set(() => ({ isVerified })),
      decrementScreen: () =>
        set((state) => ({ currentScreen: state.currentScreen - 1 })),
      setAadhar: (newAadhar) => set(() => ({ aadhar: newAadhar })),
      setAadharValid: (isValid) => set(() => ({ aadharValid: isValid })),
      resetScreen: () => set(() => ({ currentScreen: 0 })),
    }),
    {
      name: "global-storage",
    }
  )
);
