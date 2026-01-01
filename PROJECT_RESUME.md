# 🚀 Project "Dream" Handover Resume

This document is for future AI collaborators to quickly understand the project state, architecture, and recent complex fixes.

## 📌 Project Overview
An AI Video Marketing engine tailored for the Pakistan market. It converts raw media into viral-style Social Media Reels with multimodal AI context.

## 🛠️ Tech Stack & Key Files
- **Next.js 15+ & Prisma**: Core framework and database.
- **Shotstack (v1 Edit API)**: Video rendering engine (`src/lib/shotstack.ts`).
- **Gemini 1.5 Flash**: Multimodal brain for visual analysis and hook generation (`src/lib/gemini.ts`).
- **Processing Engine**: `src/lib/video-processor.ts` (Orchestrates Vision > Metadata > Shotstack).

## 🧠 Recent Breakthrough: Director 3.0
- **Visual Awareness**: The AI now samples clips and uses Gemini Vision to "see" content before generating titles.
- **Viral Hooks**: High-retention 1.5s scroll-stopping hooks (e.g., "WAIT FOR IT") with high-visibility red backgrounds.
- **Hyper-Readability**: All captions use background-boxed "Montserrat" typography to ensure 100% visibility over busy backgrounds.

## ⚠️ Critical Architecture Notes (Read Before Editing)
1. **Shotstack Schema**: 
   - `volume` belongs inside the `asset` object for videos.
   - **Empty Tracks are NOT allowed**. The track array must be filtered if a track is empty.
   - Text assets use `TextAsset` (not `TitleAsset`) for better styling control.
2. **Audio Pipeline**:
   - Uses a custom scraper (`src/lib/scraper.ts`) and finder (`src/lib/audio-finder.ts`) to get real trending Pakistani music.
   - Final audio is synced to the global `soundtrack` property for better stability.
3. **Cloudinary**:
   - Uses **Signed Client-Side Uploads** to bypass Vercel's 4.5MB limit.

## 📋 Next Steps for Collaborator
- [ ] Monitor the 3 AI variations generated in `video-processor.ts`.
- [ ] Enhance transition logic for even more "Premium" feel.
- [ ] Finalize the Instagram Share Sheet flow for desktop users.

---
*Created by Antigravity on 2026-01-01*
