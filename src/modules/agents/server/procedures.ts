import { z } from "zod";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas"; 
import { count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";


export const agentsRouter =  createTRPCRouter({
  //TODO: Change 'getOne' to use 'protectedProcedure'
      getOne: baseProcedure.input(z.object({ id: z.string() })).query(async ({input}) => {
        const [existingAgent] = await db
           .select()
           .from(agents)
           .where(eq(agents.id, input.id))

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
})
