import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


interface NewMeetingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;    
};

export const NewMeetingDialog = ({
    open,
    onOpenChange,
}: NewMeetingDialogProps) => {
    const router = useRouter();
    return (
        <ResponsiveDialog
          title="New Meeting"
          description="Create a new Meeting"
          open={open}
          onOpenChange={onOpenChange}
          >
            <div className="flex flex-col gap-y-4">
               <p>This is a new meeting dialog.</p>
               <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
            <MeetingForm 
               onSuccess={(id) => {
                onOpenChange(false);
                router.push(`/meetings/${id}`);
               }}
               onCancel={() => onOpenChange}
            />
          </ResponsiveDialog>
    );
};
