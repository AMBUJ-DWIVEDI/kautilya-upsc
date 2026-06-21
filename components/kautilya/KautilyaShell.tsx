'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import KautilyaCommandPalette from './KautilyaCommandPalette'

interface KautilyaShellProps {
  children: ReactNode
}

/**
 * Global KAUTILYA chrome: institutional toasts + command palette (⌘K / Ctrl+K).
 */
export default function KautilyaShell({ children }: KautilyaShellProps) {
  return (
    <>
      {children}
      <KautilyaCommandPalette />
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast:
              'card-calm border border-linen bg-ivory text-slate900 font-sans text-sm shadow-paper',
            title: 'font-semibold text-indigo',
            description: 'text-inkdim',
          },
        }}
        closeButton
        richColors={false}
      />
    </>
  )
}
