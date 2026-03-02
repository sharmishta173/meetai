 "use client";
 
import { EmptyState } from "@/components/empty-state";
 
type Props = Record<string, never>;
 
 export const ProcessingState = ({}: Props) => {
   return (
    <div className="bg-white rounded-lg border px-10 py-12 flex flex-col gap-8 items-center justify-center w-full max-w-4xl min-h-[320px] mx-auto">
       <EmptyState
         image="/processing.svg"
         title="Processing"
         description="Your meeting is being processed"
       />
     </div>
   );
 }
