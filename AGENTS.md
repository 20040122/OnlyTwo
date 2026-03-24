<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
Project Overview

This is a 1-on-1 private chat app for intimate relationships.
Each user can only talk to one person in a dedicated private space.
This is not a social platform.

Core model: one user ↔ one partner ↔ one conversation

⸻

Core Rules (Highest Priority)
	•	One user can bind to only one partner
	•	One relationship corresponds to exactly one conversation
	•	Only the two users can access the conversation
	•	Do not add group chat, multi-session, or social features

These rules must never be broken.

⸻

Tech Stack
	•	Next.js (App Router) + React + TypeScript + Tailwind
	•	Supabase (PostgreSQL, Auth, Realtime)
	•	Deployment on Vercel

⸻

Project Structure
	•	app: routing and pages
	•	features: business logic (most important)
	•	components: UI
	•	lib: shared utilities
	•	supabase: schema and migrations

Domain separation must be strict:
	•	relationship = binding between users
	•	conversation = chat container
	•	message = message system

Do not mix these domains.

⸻

Development Principles
	•	Always prefer modifying existing code instead of creating new modules
	•	Keep changes minimal and focused
	•	Follow existing patterns and naming
	•	Read related feature code before making changes

⸻

Architecture Rules
	•	All business logic must live in features
	•	Do not put logic in app or UI components

Structure:
	•	server.ts handles queries
	•	actions.ts handles mutations

Guards must enforce:
	•	user can only bind once
	•	cannot bind to self
	•	only members can access data

⸻

Messaging Rules
	•	Message states (sending, failed) are frontend-only
	•	Do not store these states in database
	•	Messages must be ordered by created_at
	•	Read status stored in conversation_members
	•	Use realtime, avoid polling

⸻

Relationship Rules

Binding flow:
	•	create invite
	•	accept invite
	•	create relationship, conversation, members

Unbinding:
	•	must be safe
	•	do not delete messages
	•	do not break data integrity

⸻

API Rules
	•	APIs must stay thin
	•	Delegate logic to features
	•	Always validate user session
	•	Always check permissions

⸻

Security Rules
	•	All APIs require authentication
	•	Never trust client input
	•	Always verify ownership
	•	Never expose other users’ data

⸻

What NOT to Do
	•	Do not add new dependencies unless necessary
	•	Do not refactor unrelated code
	•	Do not bypass guards
	•	Do not store UI state in database
	•	Do not mix relationship and conversation logic

⸻

MVP Scope

Only implement:
	•	authentication
	•	relationship binding
	•	single conversation
	•	messaging
	•	read status
	•	basic UI

Everything else is out of scope.
