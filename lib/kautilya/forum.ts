import { z } from 'zod'

export const forumThreadInput = z.object({
  roomId: z.string().uuid(),
  title: z.string().trim().min(4).max(140),
  body: z.string().trim().min(10).max(5000),
}).strict()

export const forumReplyInput = z.object({
  body: z.string().trim().min(2).max(3000),
}).strict()

export const forumReportInput = z.object({
  reason: z.string().trim().min(4).max(500),
}).strict()

export function canDeleteForumContent(actorId: string, authorId: string) {
  return actorId === authorId
}

export function canModerateForum(
  email: string | null | undefined,
  adminEmail: string | undefined,
) {
  return Boolean(email && adminEmail && email === adminEmail)
}
