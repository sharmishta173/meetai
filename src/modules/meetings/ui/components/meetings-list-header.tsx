"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { NewMeetingDialog } from "./new-meeting-dialog";
import { useState } from "react";
import { MeetingsSearchFilter } from "./meetings-search-filter";
import { StatusFilter } from "./status-filter";
import { AgentIdFilter } from "./agent-id-filter";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


export const MeetingsListHeader = () => {
    const [ filters, setFilters ] = useMeetingsFilters()
    const [ isDialogOpen, setIsDialogOpen ] = useState(false);
    const isAnyFilterModified =
      (filters.search?.length ?? 0) > 0 ||
      (filters.status?.length ?? 0) > 0 ||
      (filters.agentId?.length ?? 0) > 0 ||
      (filters.page ?? DEFAULT_PAGE) !== DEFAULT_PAGE;


    const onClearFilters = () => {
        setFilters({
          status: "",
          agentId: "",
          search: "",
        pageSize: DEFAULT_PAGE_SIZE,
          page: DEFAULT_PAGE,
     } );
    };
    return (
        <>
        <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <h5 className="font-medium text-xl">My Meetings</h5>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusIcon />
                    New Meeting
                </Button>
            </div>
            <ScrollArea>
            <div className="flex items-center gap-x-2 p-1">
              <MeetingsSearchFilter />
              <StatusFilter />
              <AgentIdFilter />
              <Button
                variant="outline"
                type="button"
                onClick={onClearFilters}
                disabled={!isAnyFilterModified}
              >
                <XCircleIcon className="size-4" />
                Clear
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
        </>
    );

};
