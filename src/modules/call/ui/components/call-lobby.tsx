import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { 
    DefaultVideoPlaceholder,
    StreamVideoParticipant,
    ToggleAudioPreviewButton,
    ToggleVideoPreviewButton,
    VideoPreview,
} from "@stream-io/video-react-sdk";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { GeneratedAvatarUri } from "@/lib/avatar";

import "@stream-io/video-react-sdk/dist/css/styles.css";
interface Props {
    onJoin: () => void;
};  

const DisabledVideoPreview = () => {
    const { data } = authClient.useSession();
    return (
        <DefaultVideoPlaceholder
          participant={
            {
                name: data?.user.name ?? "",
                image:
                   data?.user.image ??
                   GeneratedAvatarUri({
                     seed: data?.user.name ?? "",
                     variant: "initials",
                   }),
            } as StreamVideoParticipant
          }
        
        />
    )
}
   
 export const CallLobby = ({ onJoin }: Props) => {

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
                <div className="flex flex-col gap-y-2 text-center">
                    <h6 className="text-lg font-medium">Ready to join?</h6>
                    <p className="text-sm">Set up your call before joining</p>
                </div>
                <VideoPreview 
                   DisabledVideoPreview={DisabledVideoPreview}
                />
                <div className="flex gap-x-2">
                    <ToggleAudioPreviewButton />
                    <ToggleVideoPreviewButton />
                </div>
                <div className="flex gap-x-2 justify-between w-full"> 
                    <Button asChild variant="ghost">
                        <Link href="/meetings">
                        Cancel
                        </Link>
                    </Button>
                    <Button
                      onClick={onJoin}
                    >
                        <LogInIcon />
                        Join Call
                    </Button>

                </div>
            </div>
        </div>
    )
 }
