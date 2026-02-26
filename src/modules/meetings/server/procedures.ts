import { z } from "zod";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema } from "../schemas";


export const meetingsRouter =  createTRPCRouter({
    getOne: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const [existingMeeting] = await db
          .select({
            ...getTableColumns(meetings),
          })
          .from(meetings)
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

    // Optional-input getMany for compatibility with dehydrated queries
    getMany: baseProcedure
      .input(
        z
          .object({
            page: z.number().optional(),
            pageSize: z.number().optional(),
            search: z.string().optional().nullable(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const search = input?.search ?? "";
        const page = input?.page ?? DEFAULT_PAGE;
        const pageSizeRaw = input?.pageSize ?? DEFAULT_PAGE_SIZE;
        const pageSize = Math.max(MIN_PAGE_SIZE, Math.min(MAX_PAGE_SIZE, pageSizeRaw));

        const items = await db
          .select({
            ...getTableColumns(meetings),
          })
          .from(meetings)
          .where(search ? ilike(meetings.name, `%${search}%`) : undefined)
          .orderBy(desc(meetings.createdAt), desc(meetings.id))
          .limit(pageSize)
          .offset((page - 1) * pageSize);

        const [totalRow] = await db
          .select({ count: count() })
          .from(meetings)
          .where(search ? ilike(meetings.name, `%${search}%`) : undefined);

        const total = totalRow?.count ?? 0;
        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
          items,
          total,
          totalPages,
        };
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

        return createdMeeting;
      }),
});
