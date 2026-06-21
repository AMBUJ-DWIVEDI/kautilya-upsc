'use client'

import { useEffect } from 'react'
import type { SmartNote } from '@/lib/notes/types'
import SmartNoteReader from '@/components/kautilya/SmartNoteReader'
import { trackEvent } from '@/lib/kautilya/events'

interface NotePremiumReaderProps {
  note: SmartNote
}

export default function NotePremiumReader({ note }: NotePremiumReaderProps) {
  useEffect(() => {
    trackEvent('kautilya_smart_note_opened', {
      note_id: note.id,
      section: note.section,
      topic: note.topic,
    })
  }, [note.id, note.section, note.topic])

  return <SmartNoteReader note={note} content={note.content} />
}
