"use client";

import { EmptyState } from "@/components/empty-state"


export const CancelledState = () => {
        return (
        <div className="bg-white rounded-lg border px-8 py-10 flex flex-col gap-6 items-center justify-center w-full max-w-3xl mx-auto">
            <EmptyState
              image="/cancelled.svg"
              title="Meeting cancelled"
              description="This meeting was cancelled"
              />
              
        </div>
    )
}

