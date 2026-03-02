"use client";

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VideoIcon, BanIcon } from "lucide-react"

interface Props {
     meetingId: string;
     onCancelMeeting: () => void;
     isCancelling: boolean;
}

export const UpcomingState = ({
    meetingId,
    onCancelMeeting,
    isCancelling,
}: Props) => {
    return (
        <div className="bg-white rounded-lg px-4 py-6 flex flex-col gap-6 items-center justify-center">
            <EmptyState
              image="/upcoming.svg"
              title="Not started yet"
              description="Once you start this meeting, a summary will appear here"
              />
              <div className="mt-2 flex w-full max-w-md flex-col-reverse lg:flex-row lg:justify-center items-center gap-3">
                <Button
                  variant="secondary"
                  className="w-full lg:w-auto"
                  onClick={onCancelMeeting}
                  disabled={isCancelling}
                >
                    <BanIcon className="mr-2" />
                    Cancel meeting
                </Button>
                <Button disabled={isCancelling} asChild className="w-full lg:w-auto">
                    <Link href={`/call/${meetingId}`}>
                        <VideoIcon className="mr-2" />
                        Start meeting
                    </Link>
                </Button>
           </div>
        </div>
    )
}
