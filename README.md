# zentro

Peer-to-peer video calls in the browser. Share a link, your contact joins — no accounts, no downloads. Video and audio go directly between the two participants over WebRTC; nothing touches a server.

Built with Next.js (frontend), a small Node WebSocket signaling server, and Groq's Whisper model for optional transcript generation.

## How it works

- `apps/web` — Next.js app: landing page, lobby, room UI with video grid, controls, chat, participant list, local audio recording and transcription.
- `apps/signaling` — WebSocket server that pairs two clients per room and relays SDP offers/answers and ICE candidates. Keeps no history: after the connection is established all media flows directly between peers.
- `packages/types` — shared TypeScript types for the signaling protocol and transcript segments.

## Development

Requires Node 20+ and pnpm.

```sh
pnpm install

# start the signaling server (port 8080)
pnpm --filter @webrtc-conf/signaling dev

# start the web app
pnpm --filter @webrtc-conf/web dev
```

Create `apps/web/.env.local` from `.env.local.example` and add a Groq API key if you want transcription.

Run tests with `pnpm test:unit`.

## Deployment

The signaling server ships with a Dockerfile; the web app is a standard Next.js app and deploys to any platform that supports it. Set `NEXT_PUBLIC_SIGNALING_URL` (wss://...) on the web app so it knows where to find the signaling server, and `GROQ_API_KEY` for transcription.
