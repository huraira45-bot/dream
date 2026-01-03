# 🌙 Dream App - AI Marketing Engine

Dream is a hyper-localized AI Video & Design engine built for the Pakistan market. It transforms raw media items (photos and videos) into viral-style social media content using multimodal AI and native rendering technologies.

## ✨ Core Features
- **🎬 Viral Reel Generator**: High-retention video generation using Shotstack and Gemini Vision.
- **🎨 Native Brand Engine**: Millisecond-speed, branded static post generation (Next.js Edge).
- **🤖 Illustration Fallback**: Smart AI illustration generation (Pollinations AI) for businesses without media.
- **🏢 Brand Identity Manager**: Automated color extraction and custom logo management.
- **📅 Marketing Calendar**: AI-driven suggestions based on upcoming national and global events.

## 🚀 Tech Stack
- **Frontend**: Next.js 15 (App Router, Edge Runtime), Tailwind CSS, Lucide React.
- **Backend/Database**: PostgreSQL (Vercel Postgres), Prisma ORM.
- **AI Brain**: Gemini 1.5 Flash (Vision & Creative Flow), Groq (Creative Logic).
- **Rendering**: Next.js ImageResponse (Satori), Shotstack v1 (Video).
- **Storage**: Cloudinary (Media Assets & Rendered Outputs).

## 🛠️ Getting Started

1. **Clone the repo**:
   ```bash
   git clone https://github.com/huraira45-bot/dream.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `CLOUDINARY_URL`
   - `SHOTSTACK_KEY`

4. **Initialize Database**:
   ```bash
   npx prisma db push
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 📝 Project Docs
For a deep dive into the architecture and recent fixes, see:
- [PROJECT_RESUME.md](./PROJECT_RESUME.md)
- [canva_setup_guide.md](./canva_setup_guide.md)

---
*Built with ❤️ by Huraira & Antigravity AI*
