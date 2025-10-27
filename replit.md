# ZARA AI HUB

## Overview

ZARA AI HUB is an AI-powered platform that provides text generation, image creation, and conversational AI capabilities. Built with React and TypeScript, the application leverages Supabase for backend services and integrates with external AI APIs (Pollinations AI) for content generation. The platform supports multi-user authentication, customizable AI models, admin controls, real-time announcements, and user engagement features like ratings and comments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **Vite + React 18**: Modern build tool with fast HMR and optimized production builds
- **TypeScript**: Type-safe development with relaxed strictness settings for rapid iteration
- **React Router**: Client-side routing for multi-page navigation (Landing, Login, Signup, App, Admin)

**UI Component System**
- **shadcn/ui + Radix UI**: Accessible, unstyled component primitives with custom styling
- **Tailwind CSS**: Utility-first CSS with custom design system (HSL color variables, gradients, custom fonts)
- **Responsive Design**: Mobile-first approach with adaptive layouts and hamburger menus

**State Management Pattern**
- **Context API**: Two primary contexts manage application-wide state:
  - `AppContext`: AI models, image models, settings, announcements, rate limits
  - `AuthContext`: User authentication state, session management, admin status
- **React Query**: Server state management for Supabase interactions
- **Local State**: Component-level useState for UI interactions

**Key Design Decisions**
- Chose Context API over Redux for simpler state management needs
- Selected shadcn/ui for balance between customization and accessibility
- Implemented client-side routing with fallback handling (vercel.json rewrites)

### Backend Architecture

**Authentication & User Management**
- **Supabase Auth**: Handles user signup, login, session management
- **Row Level Security (RLS)**: Database-level access control policies
- **Profile System**: Optional user profiles stored in `profiles` table with username support
- **Admin Authentication**: Hybrid approach using client-side password (`zarahacks`) with admin flag in database

**Database Schema (Supabase/PostgreSQL)**
- `ai_models`: Text generation model configurations (name, behavior, emoji, system_prompt, description)
- `image_models`: Image generation model configurations (name, emoji, api_endpoint, model_type, example_prompts)
- `profiles`: User profile data (username, created_at, updated_at)
- `announcements`: Admin broadcast messages with likes/dislikes tracking
- `announcement_reactions`: User reactions to announcements
- `global_limits`: System-wide rate limiting configuration

**Data Synchronization Strategy**
- **AI Models & Image Models**: Stored in Supabase database tables (`ai_models`, `image_models`) and sync across all users in real-time
- **Admin Changes**: When admin adds/edits/deletes models, changes immediately visible to all users via Supabase
- **Announcements**: Use Supabase Realtime subscriptions for live updates
- **Local Storage**: Used for client-side preferences and temporary data (dismissed broadcasts, settings)
- **Migration**: Moved from localStorage to Supabase for models (October 2025) to enable cross-user synchronization

**Rate Limiting System**
- Configurable daily limits for text and image generation
- Admin-controlled unlimited mode toggle
- Limits stored in both AppContext state and Supabase `global_limits` table
- Client-side enforcement (not server-enforced currently)

### External Dependencies

**AI Service Integration**
- **Pollinations AI API**: Primary AI service for both text and image generation
  - Text Generation: `https://text.pollinations.ai/` (streaming responses)
  - Image Generation: `https://image.pollinations.ai/prompt` (multiple models: Flux, DALL-E 3, Stable Diffusion XL, Playground v2.5)
  - Text-to-Speech: `https://text.pollinations.ai/` with voice parameter
- **No API Keys Required**: Pollinations AI is free and open-access
- **Model Support**: Dynamic model selection with configurable endpoints and parameters

**Database Service**
- **Supabase**: Backend-as-a-Service providing:
  - PostgreSQL database with automatic RLS policies
  - Authentication service (email/password)
  - Real-time subscriptions for live data updates
  - Edge Functions capability (not currently used)
- **Connection**: Environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Deployment Platforms**
- **Netlify/Vercel**: Static site hosting with SPA routing support
- Build command: `npm run build`
- Output directory: `dist`
- **SPA Routing Fix**: `vercel.json` configured to rewrite all routes to `/index.html` (fixes blank page on refresh)
- Environment variables required: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Security Considerations**
- Current implementation uses client-side admin password (not production-ready for public deployment)
- RLS policies allow anonymous read/write to model tables (security gap documented in SECURITY_NOTE.md)
- Recommended improvements: Implement Supabase Auth roles, server-side validation via Edge Functions, or restrict to internal use only

**UI Component Libraries**
- Radix UI primitives (dialogs, dropdowns, tooltips, etc.)
- Lucide React for icons
- React Hook Form + Zod for form validation
- Sonner for toast notifications
- Embla Carousel for image carousels