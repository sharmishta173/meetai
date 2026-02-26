import { AgentIdView, 
        AgentIdViewLoading,
        AgentIdViewError  } from "@/modules/agents/ui/views/agent-id-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import auth from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

interface Props {
    params:Promise<{ agentId: string }>
    };
    const Page = async ({ params }: Props) => {
        const { agentId } = await params;

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            redirect("/sign-in");
        }

        const queryClient = getQueryClient();
        
        try {
            await queryClient.fetchQuery(
                trpc.agents.getOne.queryOptions({ id: agentId })
            );
        } catch (error: any) {
            if (error?.code === "NOT_FOUND" || error?.data?.code === "NOT_FOUND") {
                notFound();
            }
            // Other errors will be caught by ErrorBoundary on client
        }

        return ( 
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<AgentIdViewLoading />}>
                    <ErrorBoundary fallback={<AgentIdViewError />}>
                        <AgentIdView agentId={agentId} />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
         );
    }

export default Page;