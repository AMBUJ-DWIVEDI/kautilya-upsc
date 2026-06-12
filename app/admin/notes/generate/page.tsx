import { createClient } from '@/lib/supabase/server'
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

  // Load existing note for edit mode
  let existingNote = null
  if (editId) {
    const { data } = await supabase
      .from('smart_notes')
      .select('*')
      .eq('id', editId)
      .single()
    existingNote = data
  }

  return <NoteGeneratorUI existingNote={existingNote} />
}
