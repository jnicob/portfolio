# Nico Behm — Professional Portfolio & Media Kit

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-orange.svg)](https://pnpm.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4.svg)](https://tailwindcss.com/)

Bilingual (**Spanish / English**) professional portfolio and interactive media UI library built as a modern **Next.js 16 monorepo**.

This repository is designed to be audited as a portfolio piece itself—showcasing software engineering best practices, strict TypeScript conventions, automated testing, accessibility (a11y), and agent-agnostic development workflows.

---

## 🏗️ Architecture & Project Structure

This monorepo uses `pnpm` workspaces:

```text
.
├── apps/
│   └── web/                   # Next.js 16 App Router (Dual Runtime: Static Export default / Node)
├── packages/
│   └── media-kit/             # Custom UI library (@nicobehm/media-kit) for rich media interactions
├── skills/                    # Knowledge skills loaded by AI coding assistants
├── agents/                    # Subagent review lenses (Design, QA, Accessibility, Performance)
└── AGENTS.md                  # Universal configuration for AI coding agents
```

---

## ✨ Key Features & Highlights

- **Bilingual (es/en)**: Full internationalization support with clean URL routing.
- **Dual Runtime Setup**: Static export build by default (`output: 'export'`) with support for server runtime features when enabled.
- **Semantic Design System**: Theme tokens built on CSS custom properties and dynamic `data-theme` switching (Light / Dark mode).
- **Accessibility & UX**: Keyboard navigable interactive components, ARIA compliance, and smooth touch interactions.
- **AI Agent Tooling**: Native integration with `AGENTS.md` and custom skills for pair-programming AI tools (Claude Code, Cursor, Codex, Gemini CLI, Copilot).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- `pnpm` (v9+)

### Installation

```bash
pnpm install
```

### Local Development

Start the Next.js development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality Gates & Scripts

Run the full validation suite locally:

```bash
# Run ESLint check
pnpm run lint

# Check code formatting (Prettier)
pnpm run format

# Strict TypeScript typechecking across all workspace packages
pnpm run typecheck

# Run unit & integration tests (Vitest)
pnpm run test
```

### Production Build

```bash
# Static export build (default target: apps/web/out/)
pnpm run build

# Node server build (optional)
NEXT_OUTPUT_MODE=node pnpm run build
```

---

## 📄 License

MIT © [Nico Behm](https://github.com/jnicob)
