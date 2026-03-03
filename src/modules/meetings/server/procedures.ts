import { z } from "zod";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";
import { GeneratedAvatarUri } from "@/lib/avatar";
import { streamVideo } from "@/lib/stream-video";
  

export const meetingsRouter =  createTRPCRouter({
   generateToken: protectedProcedure.mutation(async ({ ctx }) => {
     const hasApiKey =
       !!process.env.STREAM_VIDEO_API_KEY || !!process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
     const hasSecret = !!process.env.STREAM_VIDEO_SECRET_KEY;
     if (!hasApiKey || !hasSecret) {
       throw new TRPCError({
         code: "PRECONDITION_FAILED",
         message:
           "Stream Video keys are not configured on the server. Set STREAM_VIDEO_API_KEY (or NEXT_PUBLIC_STREAM_VIDEO_API_KEY) and STREAM_VIDEO_SECRET_KEY.",
       });
     }
     try {
       await streamVideo.upsertUsers([
         {
           id: ctx.auth.user.id,
           name: ctx.auth.user.name,
           role: "admin",
           image:
             ctx.auth.user.image ??
             GeneratedAvatarUri({ seed: ctx.auth.user.name, variant: "initials" }),
         },
       ]);
 
       const expirationTime = Math.floor(Date.now() / 1000) + 3600;
       const issuedAt = Math.floor(Date.now() / 1000) - 60;
 
       const token = streamVideo.generateUserToken({
         user_id: ctx.auth.user.id,
         exp: expirationTime,
         validity_in_seconds: issuedAt,
       });
       return token;
     } catch (e: unknown) {
       const err = e as { message?: string };
       throw new TRPCError({
         code: "INTERNAL_SERVER_ERROR",
         message: err?.message ?? "Failed to generate Stream user token",
       });
     }
   }),
   generateTokenForJoin: protectedProcedure
     .input(z.object({ meetingId: z.string() }))
     .mutation(async ({ ctx, input }) => {
       const hasApiKey =
         !!process.env.STREAM_VIDEO_API_KEY || !!process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
       const hasSecret = !!process.env.STREAM_VIDEO_SECRET_KEY;
       if (!hasApiKey || !hasSecret) {
         throw new TRPCError({
           code: "PRECONDITION_FAILED",
           message:
             "Stream Video keys are not configured on the server. Set STREAM_VIDEO_API_KEY (or NEXT_PUBLIC_STREAM_VIDEO_API_KEY) and STREAM_VIDEO_SECRET_KEY.",
         });
       }
       try {
         await streamVideo.upsertUsers([
           {
             id: ctx.auth.user.id,
             name: ctx.auth.user.name,
             role: "admin",
             image:
               ctx.auth.user.image ??
               GeneratedAvatarUri({ seed: ctx.auth.user.name, variant: "initials" }),
           },
         ]);
         const call = streamVideo.video.call("default", input.meetingId);
         await call.getOrCreate({
           data: {
             created_by_id: ctx.auth.user.id,
           },
         });
 
         const expirationTime = Math.floor(Date.now() / 1000) + 3600;
         const issuedAt = Math.floor(Date.now() / 1000) - 60;
         const token = streamVideo.generateUserToken({
           user_id: ctx.auth.user.id,
           exp: expirationTime,
           validity_in_seconds: issuedAt,
         });
         return token;
       } catch (e: unknown) {
         const err = e as { message?: string };
         throw new TRPCError({
           code: "INTERNAL_SERVER_ERROR",
           message: err?.message ?? "Failed to prepare call or generate token",
         });
       }
     }),
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
         const call = streamVideo.video.call("default", createdMeeting.id);
         await call.getOrCreate({
          data: {
            created_by_id: ctx.auth.user.id,
            custom: {
                meetingId: createdMeeting.id,
                meetingName: createdMeeting.name
            },
            settings_override: {
              transcription: {
                language: "en",
                mode: "auto-on",
                closed_caption_mode: "auto-on",
              },
              recording: {
                mode: "auto-on",
                quality: "1080p",
              },
            },
          },
         });
        

        const [existingAgent] = await db
          .select()
          .from(agents)
          .where(eq(agents.id, createdMeeting.agentId));

          if(!existingAgent) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Agent not found",
            });
          }

          await streamVideo.upsertUsers([
            {
              id: existingAgent.id,
              name: existingAgent.name,
              role: "user",
              image: GeneratedAvatarUri({
                seed: existingAgent.name,
                variant: "botttsNeutral",
              }),
            },
          ]);

          return createdMeeting;
      }),
});
