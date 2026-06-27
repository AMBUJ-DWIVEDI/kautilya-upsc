import { describe, expect, it } from 'vitest'
import {
  canDeleteForumContent,
  canModerateForum,
  forumReplyInput,
  forumThreadInput,
} from '@/lib/kautilya/forum'

describe('KAUTILYA forum rules', () => {
  it('validates thread and reply boundaries', () => {
    expect(forumThreadInput.safeParse({ roomId: 'x', title: '', body: '' }).success).toBe(false)
    expect(forumThreadInput.safeParse({
      roomId: '00000000-0000-0000-0000-000000000000',
      title: 'A'.repeat(141),
      body: 'Valid discussion body',
    }).success).toBe(false)
    expect(forumReplyInput.safeParse({ body: 'A useful reply' }).success).toBe(true)
  })

  it('separates author deletion from admin moderation', () => {
    expect(canDeleteForumContent('user-1', 'user-1')).toBe(true)
    expect(canDeleteForumContent('user-2', 'user-1')).toBe(false)
    expect(canModerateForum('admin@example.com', 'admin@example.com')).toBe(true)
    expect(canModerateForum('member@example.com', 'admin@example.com')).toBe(false)
  })
})
