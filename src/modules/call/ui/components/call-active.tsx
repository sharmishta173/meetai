"use client";

import { VideoIcon } from "lucide-react";
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";

interface Props {
  meetingName: string;
  onLeave: () => void;
}

export const CallActive = ({ meetingName, onLeave }: Props) => {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="px-4 pt-3">
        <div className="mx-auto w-full rounded-full bg-black h-10 flex items-center">
          <div className="pl-4 inline-flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 text-white size-6">
              <VideoIcon className="size-4" />
            </span>
            <span className="text-white/90 text-sm">{meetingName}</span>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-[92vw] max-w-[1280px] md:w-[88vw] md:max-w-[1440px] aspect-video rounded-2xl overflow-hidden bg-black">
          <SpeakerLayout />
        </div>
      </main>
      <footer className="pb-3 px-4">
        <div className="mx-auto w-full rounded-full bg-black h-16 flex items-center justify-center">
          <div className="px-4">
            <CallControls onLeave={onLeave} />
          </div>
        </div>
      </footer>
    </div>
  );
};

