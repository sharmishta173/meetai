"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { DataTable } from "@/components/data-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { DataPagination } from "@/components/data-pagination";
import { useRouter } from "next/navigation";

const MeetingsView = () => {
    const trpc = useTRPC();
    const router = useRouter();
    const [filters, setFilters] = useMeetingsFilters();
    const statusParam = filters.status
      ? (filters.status as "upcoming" | "active" | "completed" | "processing" | "cancelled")
      : undefined;
    const { data } = useSuspenseQuery(
      trpc.meetings.getMany.queryOptions({
        search: filters.search ?? "",
        page: filters.page,
        pageSize: filters.pageSize,
        status: statusParam,
        agentId: filters.agentId ? filters.agentId : undefined,
      })
    );
    return (
        <div className="px-4 md:px-8 pb-10 flex flex-col gap-y-6">
           <DataTable 
           data={data.items} 
           columns={columns} 
           onRowClick={(row) => router.push(`/meetings/${row.id}`)}/>
           <DataPagination 
            page={filters.page}
            totalPages={data.totalPages}
            onPageChange={(page) => setFilters({page})}
           />
            {(data?.items?.length ?? 0) === 0 && (
                          <EmptyState
                              title="Create your first meeting"
                              description="Schedule a meeting to connect with others.Each meeting lets you collaborate, share ideas, and interact with participants in real time."
                          /> 
                       )}
        </div>
    );
};

export default MeetingsView;
export const MeetingsViewLoading = () => {
    return (
        <LoadingState
          title="Loading Meetings" 
          description="This may take a few seconds"
        />
    );
};

export const MeetingsViewError = () => {
    return (
        <ErrorState
            title="Error Loading Meetings"
            description="Something went wrong"
        />
    );
};
 
