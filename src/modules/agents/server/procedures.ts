import { z } from "zod";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas"; 
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";


export const agentsRouter =  createTRPCRouter({
    getOne: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const [existingAgent] = await db
          .select({
            meetingCount: sql<number>`6`,
            ...getTableColumns(agents),
          })
          .from(agents)
          .where(
            and(
              eq(agents.id, input.id),
              eq(agents.userId, ctx.auth.user.id),
            )
          );

        if (!existingAgent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" })
        }

        return existingAgent;
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
            meetingCount: sql<number>`6`,
            ...getTableColumns(agents),
          })
          .from(agents)
          .where(search ? ilike(agents.name, `%${search}%`) : undefined)
          .orderBy(desc(agents.createdAt), desc(agents.id))
          .limit(pageSize)
          .offset((page - 1) * pageSize);

        const [totalRow] = await db
          .select({ count: count() })
          .from(agents)
          .where(search ? ilike(agents.name, `%${search}%`) : undefined);

        const total = totalRow?.count ?? 0;
        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
          items,
          total,
          totalPages,
        };
      }),
    create: protectedProcedure
      .input(agentsInsertSchema)
      .mutation(async ({ input, ctx }) => {
        const [createdAgent] = await db
          .insert(agents)
          .values({
            ...input,
            userId: ctx.auth.user.id,
          })
          .returning();

        return createdAgent;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        instructions: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...values } = input;
        const [updatedAgent] = await db
          .update(agents)
          .set(values)
          .where(
            and(
              eq(agents.id, id),
              eq(agents.userId, ctx.auth.user.id),
            )
          )
          .returning();

        if (!updatedAgent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }

        return updatedAgent;
      }),
    remove: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const [deletedAgent] = await db
          .delete(agents)
          .where(
            and(
              eq(agents.id, input.id),
              eq(agents.userId, ctx.auth.user.id),
            )
          )
          .returning();

        if (!deletedAgent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }

        return deletedAgent;
      }),
})
