'use client'

import type { ConnectionState } from '@webrtc-conf/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, WifiOff } from 'lucide-react'

type Props = {
  state: ConnectionState
}

export function ConnectionBanner({ state }: Props) {
  let content = null

  if (state === 'connecting') {
    content = {
      message: 'Connecting to peer...',
      color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
      icon: <Loader2 className="w-4 h-4 animate-spin" />
    }
  } else if (state === 'reconnecting') {
    content = {
      message: 'Connection degraded, reconnecting...',
      color: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      icon: <Loader2 className="w-4 h-4 animate-spin" />
    }
  } else if (state === 'failed') {
    content = {
      message: 'Call ended — connection lost',
      color: 'bg-red-500/20 text-red-500 border-red-500/30',
      icon: <WifiOff className="w-4 h-4" />
    }
  }

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full flex justify-center py-4 absolute top-0 z-50 pointer-events-none"
        >
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border backdrop-blur-md shadow-lg ${content.color}`}>
            {content.icon}
            {content.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
