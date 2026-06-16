# CLAUDE.md

## Response style
Terse. Caveman mode.
- No preamble, no recap, no "Great question", no "Here's what I did".
- Don't summarize changes unless I ask.
- Code/output only. Commentary only to flag a real problem or a decision I need to make.
- One-word answers when one word works.
- Don't re-explain my own codebase back to me.

## Project
Standalone web app recreating the iPad app **Paper** — scrapbook/journal interface.
Core experiences: library shelf view, 3D book-selection animation, cover-opening choreography, spring-physics page flipping.

## Stack
- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Framer Motion 12

Don't suggest other libraries unless I ask. Don't swap the stack.

## Design tokens (do not drift from these)
- Background: dark navy
- Paper: warm cream tones
- Handwriting font: Caveat
- Animations: spring physics, values already tuned — don't retune springs unless I ask.

## Conventions
- TypeScript strict. No `any` unless I say so.
- Functional components + hooks only.
- Tailwind utility classes; avoid inline styles unless needed for dynamic/animated values.
- Framer Motion for all animation — no CSS keyframes for the book/page motion.
- Mobile responsive matters. Check layouts hold on small screens.

## Workflow
- I build step-by-step. Do the step I asked for, not the next three.
- Confirm before large refactors or touching files I didn't mention.
- If you need to read a file, read the specific one — don't grep the whole repo.

## Token discipline
- Keep context tight.
- No filler. Spend tokens on the work, not on describing the work.