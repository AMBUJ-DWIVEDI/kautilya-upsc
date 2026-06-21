import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect }     from 'next/navigation'
import Link             from 'next/link'
import type { NoteStatus } from '@/lib/notes/types'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

function statusLabel(status: NoteStatus | string): string {
  if (status === 'published') return 'Published'
  if (status === 'review') return 'In review'
  if (status === 'archived') return 'Archived'
  return 'Draft'
}

export default async function AdminNotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) redirect('/dashboard')

  const admin = createAdminClient()
  const { data: notes } = await admin
    .from('smart_notes')
    .select('id, section, category, topic, slug, pyq_count, high_yield, difficulty, status, created_at')
    .order('created_at', { ascending: false })

  const published   = notes?.filter(n => n.status === 'published').length ?? 0
  const unpublished = (notes?.length ?? 0) - published

  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-4xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-chanakya-gold text-xs tracking-[0.3em] uppercase font-mono mb-2">
            Admin · Smart Notes
          </p>
          <h1 className="heading-cinzel text-chanakya-text text-2xl font-bold">
            Notes Dashboard
          </h1>
          <p className="text-chanakya-text-dim text-sm mt-1">
            {published} published · {unpublished} drafts
          </p>
        </div>
        <Link
          href="/admin/notes/generate"
          className="px-4 py-2 bg-chanakya-gold text-chanakya-bg text-sm font-bold
                     rounded-lg heading-cinzel hover:bg-chanakya-gold-light transition-colors"
        >
          + Generate Note
        </Link>
      </div>

      {/* Notes table */}
      <div className="card-dark rounded-xl overflow-hidden">
        {notes && notes.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-chanakya-muted/20">
                <th className="text-left p-3 text-chanakya-text-dim text-xs">Topic</th>
                <th className="text-center p-3 text-chanakya-text-dim text-xs hidden sm:table-cell">Section</th>
                <th className="text-center p-3 text-chanakya-text-dim text-xs hidden md:table-cell">PYQs</th>
                <th className="text-center p-3 text-chanakya-text-dim text-xs">Status</th>
                <th className="text-right p-3 text-chanakya-text-dim text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map(note => (
                <tr key={note.id} className="border-b border-chanakya-muted/10 last:border-0">
                  <td className="p-3">
                    <p className="text-chanakya-text text-sm truncate max-w-[200px]">{note.topic}</p>
                    <p className="text-chanakya-text-dim text-xs">{note.category}</p>
                  </td>
                  <td className="p-3 text-center text-chanakya-text-dim text-xs hidden sm:table-cell uppercase">
                    {note.section}
                  </td>
                  <td className="p-3 text-center hidden md:table-cell">
                    <span className={note.pyq_count > 0 ? 'text-chanakya-amber text-xs' : 'text-chanakya-text-dim text-xs'}>
                      {note.pyq_count > 0 ? `📌 ${note.pyq_count}` : '—'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      note.status === 'published'
                        ? 'bg-chanakya-green/10 text-chanakya-green'
                        : 'bg-chanakya-muted/10 text-chanakya-text-dim'
                    }`}>
                      {statusLabel(note.status)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/notes/generate?edit=${note.id}`}
                      className="text-xs text-chanakya-gold hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-chanakya-text-dim text-sm">
            No notes yet. Click &ldquo;+ Generate Note&rdquo; to start.
          </div>
        )}
      </div>
    </div>
  )
}
