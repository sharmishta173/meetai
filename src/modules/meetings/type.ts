import { meetingsRouter } from './server/procedures';
import { createTRPCRouter } from '@/trpc/init';
export const appRouter = createTRPCRouter({
    meetings: meetingsRouter,
});
//export type definition of API
export type AppRouter = typeof appRouter;

export type MeetingGetOne = {
  id: string;
  name: string;
  userId: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
  meetingCount: number;
};
