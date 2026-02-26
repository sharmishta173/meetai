import auth from "@/lib/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import MeetingsView, {
    MeetingsViewError, 
    MeetingsViewLoading } from "@/modules/meetings/ui/views/meetings-view";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({})
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<MeetingsViewLoading />}>
        <ErrorBoundary fallback={<MeetingsViewError />}>
          <MeetingsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}
 