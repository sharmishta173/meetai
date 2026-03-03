"use client";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Call,
    CallingState,
    StreamCall,
    StreamVideo,
    StreamVideoClient,
} from "@stream-io/video-react-sdk";

import { useTRPC } from "@/trpc/client";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { CallUI } from "./call-ui";
 
interface Props {
    meetingId: string;
    meetingName: string;
    userId: string;
    userName: string;
    userImage: string;
};

export const CallConnect = ({
    meetingId,
    meetingName,
    userId,
    userName,
    userImage,

}: Props) => {
    const trpc = useTRPC();
    const { mutateAsync: generateToken } = useMutation(
        trpc.meetings.generateTokenForJoin.mutationOptions(),
    );

    const [client, setClient] = useState<StreamVideoClient | undefined>();
    useEffect(() => {
        const newClient = new StreamVideoClient({
            apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
            user: {
                id: userId,
                name: userName,
                image: userImage,
            },
            tokenProvider: () => generateToken({ meetingId }),
        });
        setClient(newClient);

        return () => {
            newClient.disconnectUser();
            setClient(undefined);
        };
    }, [userId, userName, userImage, generateToken, meetingId]);

    const [call, setCall] = useState<Call | undefined>();
    useEffect(() => {
        if (!client) return;

        const newCall = client.call("default", meetingId);
        newCall.camera.disable();
        newCall.microphone.disable();
        setCall(newCall);

        return () => {
            if (newCall.state.callingState !== CallingState.LEFT){
                newCall.leave();
                newCall.endCall();
            }
            setCall(undefined);
        };
    }, [client, meetingId]);

    if(!client || !call){
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <LoaderIcon className="size-6 animate-spin text-white" />
            </div>
        );
    }
    return ( 
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallUI meetingName={meetingName}/> 
        </StreamCall>
      </StreamVideo>
    );
};

