import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect }     from 'next/navigation'
import NoteGeneratorUI from './NoteGeneratorUI'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

interface Props {
  searchParams: Promise<{ edit?: string }>
}

export default async function AdminGeneratePage({ searchParams }: Props) {
  const { edit: editId } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) redirect('/dashboard')

  // Draft/unpublished notes are invisible to RLS — load via service role.
  let existingNote = null
  if (editId) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('smart_notes')
      .select('*')
      .eq('id', editId)
      .single()
    existingNote = data
  }

  return <NoteGeneratorUI existingNote={existingNote} />
}
