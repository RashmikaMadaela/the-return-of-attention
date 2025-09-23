# The Return of Attention

A PAHM (Present Attention and Happiness Matrix) methodology meditation web application built with Next.js, TypeScript, and Tailwind CSS.

## 🧘‍♀️ About

This application implements the PAHM methodology by A.C. Amarasighe, providing a structured approach to meditation and mindfulness practice through a web-based platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd the-return-of-attention
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your actual values.

4. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + Supabase
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components  
├── lib/             # Utility functions and configurations
└── types/           # TypeScript type definitions

prisma/
└── schema.prisma    # Database schema

Main Docs/           # Project documentation
├── Project Todo List.md
├── Development Guidelines.md
├── Business Logic Documentation.md
└── Stage Details & Progression System.md
```

## 🔄 Development Workflow

This project follows a **backend-first development approach**:

1. **Weeks 1-7**: Complete backend APIs and database
2. **Weeks 8-14**: Build frontend consuming tested APIs  
3. **Week 15**: Deployment and production setup

## 📋 Current Status

✅ **Initial Setup Complete**
- Next.js project with TypeScript and Tailwind CSS
- Core dependencies installed (Prisma, NextAuth, Supabase, Zod)
- Project folder structure established
- ESLint and Prettier configurations set up
- Git repository initialized
- Placeholder files created for organized development

🔄 **Next Steps**
- Set up Supabase account and database
- Design and implement database schema
- Create authentication system

## 📁 File Structure

All files are set up with placeholder content and TODO comments:

```
src/
├── app/
│   ├── globals.css          # Basic Tailwind setup
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page (minimal)
│   └── api/                 # API routes (empty, ready for backend)
├── components/              # UI components (empty, ready for frontend)
├── lib/
│   ├── utils.ts             # Utility functions (placeholder)
│   ├── prisma.ts            # Database client (placeholder)
│   └── happiness.ts         # Happiness calculation (placeholder)
├── types/
│   └── index.ts             # TypeScript types (placeholder)
prisma/
└── schema.prisma            # Database schema (placeholder)
```

## 🤝 Contributing

1. Follow the Development Guidelines in `Main Docs/Development Guidelines.md`
2. Complete backend tasks before frontend development
3. Test all APIs thoroughly before moving to next phase
4. Use TypeScript strictly for better code quality

## 📖 Documentation

- [Project Todo List](Main%20Docs/Project%20Todo%20List.md) - Complete development roadmap
- [Development Guidelines](Main%20Docs/Development%20Guidelines.md) - Step-by-step implementation guide  
- [Stage Details](Main%20Docs/Stage%20Details%20&%20Progression%20System.md) - PAHM methodology and progression
- [Business Logic](Main%20Docs/Business%20Logic%20Documentation.md) - Core application logic and workflows

## 📝 License

MIT License - see LICENSE file for details.

---

**The Return of Attention** - Developing sustained attention through mindful practice.