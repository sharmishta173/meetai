import "server-only";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey =
  process.env.STREAM_VIDEO_API_KEY ?? process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
const secret = process.env.STREAM_VIDEO_SECRET_KEY;

type StreamVideoStub = {
  upsertUsers: (...args: unknown[]) => never;
  generateUserToken: (...args: unknown[]) => never;
  video: { call: (...args: unknown[]) => never };
};

let instance: StreamClient | StreamVideoStub;

if (!apiKey || !secret) {
  const missing = [
    !apiKey ? "STREAM_VIDEO_API_KEY or NEXT_PUBLIC_STREAM_VIDEO_API_KEY" : null,
    !secret ? "STREAM_VIDEO_SECRET_KEY" : null,
  ]
    .filter(Boolean)
    .join(", ");
  const fail = () => {
    throw new Error(
      `Stream Video server keys are not configured. Missing: ${missing}. Set them in your environment to enable calls.`
    );
  };
  instance = {
    upsertUsers: fail,
    generateUserToken: fail,
    video: { call: fail },
  };
} else {
  instance = new StreamClient(apiKey, secret);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const streamVideo: any = instance;
