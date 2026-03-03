import { useState } from "react";
import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";
interface Props {
    meetingName: string;
};

export const CallUI = ({ meetingName}: Props) => {
     const call = useCall();
     const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

     const handleJoin = async () => {
        if (!call) return;
        try {
          await call.join();
          setShow("call");
        } catch (e: unknown) {
          const err = e as { message?: string };
          toast.error(err?.message ?? "Failed to join call");
        }
     };
     const handleLeave = () => {
        if(!call) return;

        call.endCall();
        setShow("ended");
     };

     return (
        <StreamTheme className="h-full">
            <span className="sr-only">{meetingName}</span>
            {show === "lobby" && <CallLobby onJoin={handleJoin} />}
            {show === "call" && <CallActive onLeave={handleLeave} meetingName={meetingName} />}
            {show === "ended" && <CallEnded />}
        </StreamTheme>
     )
};
