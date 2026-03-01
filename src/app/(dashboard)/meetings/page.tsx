import auth from "@/lib/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import MeetingsView, {
    MeetingsViewError, 
    MeetingsViewLoading } from "@/modules/meetings/ui/views/meetings-view";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { loadSearchParams } from "@/modules/meetings/params";

interface Props { searchParams: Promise<SearchParams> }
export default async function Page({ searchParams }: Props) {
  const filters = await loadSearchParams(searchParams);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  const sanitized = {
    search: filters.search ?? "",
    page: filters.page,
    pageSize: filters.pageSize,
    status: filters.status
      ? (filters.status as "upcoming" | "active" | "completed" | "processing" | "cancelled")
      : undefined,
    agentId: filters.agentId ? filters.agentId : undefined,
  };
  try {
    await queryClient.prefetchQuery(
      trpc.meetings.getMany.queryOptions(sanitized)
    );
  } catch (error: unknown) {
    const e = error as { code?: string; data?: { code?: string } };
    if (e?.code === "UNAUTHORIZED" || e?.data?.code === "UNAUTHORIZED") {
      redirect("/sign-in");
    }
  }

  return (
    <>
    <MeetingsListHeader />
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<MeetingsViewLoading />}>
        <ErrorBoundary fallback={<MeetingsViewError />}>
          <MeetingsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
    </>
  );
}
 
