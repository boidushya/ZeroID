import { io } from "socket.io-client";

const URL: string =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_API_URL as string)
    : "http://localhost:8000";

console.log(URL);

export const socket = io(URL);
