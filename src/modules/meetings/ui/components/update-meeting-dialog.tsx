"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { Button } from "@/components/ui/button";
import { MeetingGetOne } from "../../type";

interface UpdateMeetingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;    
    initialValues : MeetingGetOne
};

export const UpdateMeetingDialog = ({
    open,
    onOpenChange,
    initialValues,
}: UpdateMeetingDialogProps) => {
    return (
        <ResponsiveDialog
          title="Edit Meeting"
          description="Edit the Meeting Details"
          open={open}
          onOpenChange={onOpenChange}
          >
            <div className="flex flex-col gap-y-4">
               <p>This is a new meeting dialog.</p>
               <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
            <MeetingForm 
               onSuccess={() => onOpenChange(false)}
               onCancel={() => onOpenChange(false)}
               initialValues={initialValues}
            />
          </ResponsiveDialog>
    );
};
