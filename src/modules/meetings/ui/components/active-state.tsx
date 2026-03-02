"use client";

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VideoIcon } from "lucide-react"

interface Props {
     meetingId: string;

}

export const ActiveState = ({
    meetingId,
}: Props) => {
    return (
        <div className="bg-white rounded-lg px-4 py-6 flex flex-col gap-6 items-center justify-center">
            <EmptyState
              image="/upcoming.svg"
              title="Meeting is active"
              description="Meeting will end once all participants have left"
              />
              <div className="mt-2 flex w-full max-w-md flex-col-reverse lg:flex-row lg:justify-center items-center gap-3">
               
                <Button asChild className="w-full lg:w-auto">
                    <Link href={`/call/${meetingId}`}>
                        <VideoIcon className="mr-2" />
                           Join meeting
                    </Link>
                </Button>
           </div>
        </div>
    )
}
export default ActiveState;
