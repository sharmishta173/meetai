import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/trpc/routers/_app";

export type AppRouter = typeof appRouter;

export type MeetingGetMany = inferRouterOutputs<AppRouter>["meetings"]["getMany"]["items"];
export type MeetingGetOne = inferRouterOutputs<AppRouter>["meetings"]["getOne"];

