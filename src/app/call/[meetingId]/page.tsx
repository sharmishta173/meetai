import auth from "@/lib/auth";
import { CallView } from "@/modules/call/views/call-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    meetingId: string;
  }>;
}

const Page = async ({ params }: Props) => {
  const { meetingId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  try {
    await queryClient.prefetchQuery(
      trpc.meetings.getOne.queryOptions({ id: meetingId })
    );
  } catch {
    redirect("/meetings");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CallView meetingId={meetingId} />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
