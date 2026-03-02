import { z } from "zod";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";
  

export const meetingsRouter =  createTRPCRouter({
    getOne: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const [existingMeeting] = await db
          .select({
            ...getTableColumns(meetings),
            agent: agents,
            duration: sql<number>`EXTRACT(EPOCH FROM (NULLIF(ended_at, '')::timestamp - NULLIF(started_at, '')::timestamp))`.as("duration"),
          })
          .from(meetings)
          .innerJoin(agents, eq(meetings.agentId, agents.id))
          .where(
            and(
              eq(meetings.id, input.id),
              eq(meetings.userId, ctx.auth.user.id),
            )
          );

        if (!existingMeeting) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" })
        }

        return existingMeeting;
      }),

    // Optional-input ge  tMany for compatibility with dehydrated queries
    getMany: protectedProcedure
      .input(
        z
          .object({
            page: z.number().optional(),
            pageSize: z.number().optional(),
            search: z.string().optional().nullable(),
            agentId: z.string().optional().nullable(),
            status: z
              .enum(["upcoming", "active", "completed", "processing", "cancelled"])
              .optional()
              .nullable(),
          })
          .optional()
      )
      .query(async ({ input, ctx }) => {
        const search = input?.search ?? "";
        const page = input?.page ?? DEFAULT_PAGE;
        const pageSizeRaw = input?.pageSize ?? DEFAULT_PAGE_SIZE;
        const pageSize = Math.max(MIN_PAGE_SIZE, Math.min(MAX_PAGE_SIZE, pageSizeRaw));
        const status = input?.status ?? undefined;
        const agentId = input?.agentId ?? undefined;

        const items = await db
          .select({
            ...getTableColumns(meetings),
            agent: agents,
            duration: sql<number>`EXTRACT(EPOCH FROM (NULLIF(ended_at, '')::timestamp - NULLIF(started_at, '')::timestamp))`.as("duration"),
          })
          .from(meetings)
          .innerJoin(agents, eq(meetings.agentId, agents.id))
          .where(
            and(
              eq(meetings.userId, ctx.auth.user.id),
              search ? ilike(meetings.name, `%${search}%`) : undefined,
              status ? eq(meetings.status, status) : undefined,
              agentId ? eq(meetings.agentId, agentId) : undefined,
            )
          )
          .orderBy(desc(meetings.createdAt), desc(meetings.id))
          .limit(pageSize)
          .offset((page - 1) * pageSize);

        const [totalRow] = await db
          .select({ count: count() })
          .from(meetings)
          .innerJoin(agents, eq(meetings.agentId, agents.id))
          .where(
            and(
              eq(meetings.userId, ctx.auth.user.id),
              search ? ilike(meetings.name, `%${search}%`) : undefined,
              status ? eq(meetings.status, status) : undefined,
              agentId ? eq(meetings.agentId, agentId) : undefined,
            )
          );

        const total = totalRow?.count ?? 0;
        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
          items,
          total,
          totalPages,
        };
      }),
      remove: protectedProcedure
          .input(z.object({ id: z.string() }))
          .mutation(async ({ input, ctx }) => {
            const { id } = input;
            const [removedMeeting] = await db
              .delete(meetings)
              .where(
                and(
                  eq(meetings.id, id),
                  eq(meetings.userId, ctx.auth.user.id),
                )
              )
              .returning();
    
            if (!removedMeeting) {
              throw new TRPCError({ 
                code: "NOT_FOUND", 
                message: "Meeting not found" });
            }
    
            return removedMeeting;
          }),
       update: protectedProcedure
          .input(meetingsUpdateSchema)
          .mutation(async ({ input, ctx }) => {
            const { id, ...values } = input;
            const [updatedMeeting] = await db
              .update(meetings)
              .set(values)
              .where(
                and(
                  eq(meetings.id, id),
                  eq(meetings.userId, ctx.auth.user.id),
                )
              )
              .returning();
    
            if (!updatedMeeting) {
              throw new TRPCError({ 
                code: "NOT_FOUND", 
                message: "Meeting not found" });
            }
    
            return updatedMeeting;
          }),

    create: protectedProcedure
      .input(meetingsInsertSchema)
      .mutation(async ({ input, ctx }) => {
        const [createdMeeting] = await db
          .insert(meetings)
          .values({
            ...input,
            userId: ctx.auth.user.id,
          })
          .returning();
        //TODO: Create Stream Call, Upser Stream Users
        return createdMeeting;
      }),
});
