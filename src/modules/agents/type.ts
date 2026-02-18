import { agentsRouter } from './server/procedures';
import { createTRPCRouter } from '@/trpc/init';
export const appRouter = createTRPCRouter({
    agents: agentsRouter,
});
//export type definition of API
export type AppRouter = typeof appRouter;