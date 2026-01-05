# 🚀 Project "Dream" Handover Resume

This document is for future AI collaborators to quickly understand the project state, architecture, and recent complex fixes.

## 📌 Project Overview
An AI Video Marketing engine tailored for the Pakistan market. It converts raw media into viral-style Social Media Reels and high-fidelity Branded Posts with multimodal AI context.

## 🛠️ Tech Stack & Key Files
- **Next.js 15+ & Prisma**: Core framework and database.
- **Native Brand Engine**: Local Satori-based renderer for high-quality static posts (`src/app/api/render/post/route.tsx`).
- **Illustration Service**: Pollinations AI (Flux) integration for the free 3D illustration fallback (`src/lib/illustration-service.ts`).
- **Shotstack (v1 Edit API)**: Video rendering engine for Reels (`src/lib/shotstack.ts`).
- **Gemini 1.5 Flash**: Multimodal brain for visual analysis and hook generation (`src/lib/gemini.ts`).
- **Processing Engine**: `src/lib/video-processor.ts` (Orchestrates Vision > Metadata > Native/Shotstack).

## 🧠 Recent Breakthroughs
1. **Elite Creative Strategist (Agentic Growth)**:
   - Upgraded LLM router to act as a viral psychologist.
   - **Dynamic Archetypes**: System now chooses between "Magazine" (editorial) and "Poster" (high-impact) layouts based on aesthetic strategy.
2. **The Harsh Critic (Visual Vibe Check)**:
   - Integrated a real-time **Vision-to-Brand validation** loop.
   - **Gemini-Validated**: Every generated post is compared against the user's logo in real-time. If the vibe misaligns, the system automatically flips layouts and retries until brand-perfect.
3. **Native Brand Engine (Director 4.0)**:
   - Replaced complex Canva/Shotstack flows with a local, zero-cost renderer.
   - **Satori-Hardened**: Fixed emoji crashes by sanitizing text and enforced explicit flex layouts for 100% stability.
   - **Base64 Proxying**: Implemented edge-prefetching for external illustrations to prevent rendering failures.

## ⚠️ Critical Architecture Notes
1. **The Vibe Check Loop**: `video-processor.ts` now runs an async loop that waits for `validatePostVibe`. Do not bypass this for Posts as it protects brand integrity.
2. **Satori Rendering**: 
   - Every `div` MUST have `display: flex`.
   - Emojis MUST be stripped using `sanitizeText` or Satori will crash at the edge.
   - External images should be converted to Base64 at the edge if visibility is inconsistent.
3. **Shotstack Schema**: 
   - `volume` belongs inside the `asset` object for videos.
   - The track array must be filtered if a track is empty.
4. **Domain Routing**:
   - Production rendering defaults to `dream-eta-ruddy.vercel.app` to avoid "403 Forbidden" errors on standard aliases.

## 📋 Next Steps for Collaborator
- [x] Integrate high-reliability Native Brand Engine.
- [x] Implement Business Logo upload and display.
- [x] Implement "The Harsh Critic" Vibe Check loop.
- [ ] Monitor the 3 AI variations generated in `video-processor.ts`.
- [ ] Enhance transition logic for even more "Premium" feel.
- [ ] Finalize the Instagram Share Sheet flow for desktop users.

---
*Updated by Antigravity on 2026-01-03 18:00 (PKT)*
