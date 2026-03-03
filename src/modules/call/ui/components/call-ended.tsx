"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export const CallEnded = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="rounded-xl border border-white/10 bg-black p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-white">Meeting ended</h2>
        <p className="mb-6 text-sm text-white/70">Thanks for joining.</p>
        <Button asChild>
          <Link href="/meetings">Back to meetings</Link>
        </Button>
      </div>
    </div>
  );
};

