'use client'

import type { ConnectionState } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, WifiOff, Wifi } from 'lucide-react'

type Props = {
  state: ConnectionState
}

export function ConnectionBanner({ state }: Props) {
  let content = null

  if (state === 'connecting') {
    content = {
      message: 'Connecting to peer…',
      color: 'rgba(251,191,36,0.14)',
      border: 'rgba(251,191,36,0.32)',
      text: '#fbbf24',
      spin: true,
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    }
  } else if (state === 'reconnecting') {
    content = {
      message: 'Connection degraded, reconnecting…',
      color: 'rgba(251,146,60,0.14)',
      border: 'rgba(251,146,60,0.32)',
      text: '#fb923c',
      spin: true,
      icon: <Wifi className="w-3.5 h-3.5" />,
    }
  } else if (state === 'failed') {
    content = {
      message: 'Call ended — connection lost',
      color: 'rgba(240,71,95,0.14)',
      border: 'rgba(240,71,95,0.32)',
      text: 'var(--danger-bright)',
      spin: false,
      icon: <WifiOff className="w-3.5 h-3.5" />,
    }
  }

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute top-0 left-0 right-0 z-40 flex justify-center pt-4"
        >
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium backdrop-blur-md"
            style={{
              background: content.color,
              border: `1px solid ${content.border}`,
              color: content.text,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {content.icon}
            {content.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
