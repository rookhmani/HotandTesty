# Hot And Tasty Food Shop — PRD

## Original Problem Statement
Build a modern, minimal food e-commerce website for "Hot And Tasty Food Shop" — a fast food restaurant in Ghaziabad, UP, India. Dark theme (#0D0D0D), bold orange (#FF6B35) and golden yellow (#FFD700) accents. Hero, Menu/Shop with categories, About with rating, Order Info with map, Footer. Cart with add/remove/qty + total. Mobile-first responsive with smooth scroll, fade-in on scroll, and hover animations.

## User Choices (locked)
- **Stack:** React + FastAPI + MongoDB
- **Cart & Checkout:** Cart + Checkout form + Stripe online payment (COD also supported)
- **Menu:** Specific menu (Indo-Chinese / fast food — 48 items)
- **Admin Panel:** Yes (simple password auth)
- **Logo:** Text-based, "Hot&Tasty" in orange/gold/off-white

## Core Architecture
- **Backend:** `/app/backend/server.py` — FastAPI + Motor (Mongo). Stripe via `emergentintegrations.payments.stripe.checkout`. Endpoints under `/api`.
- **Frontend:** React 19, react-router 7, Tailwind, shadcn/ui (Sheet, Dialog), sonner toasts, lucide-react icons, fonts Anton + Outfit.
- **DB collections:** `menu_items`, `orders`, `payment_transactions`.
- **Routes:** `/` (Home), `/admin`, `/success?session_id=…`, `/cancel`.

## Design System
- Color: `#0D0D0D` bg, `#1A1A1A` surface, `#FF6B35` primary, `#FFD700` secondary, `#F5F5F0` text, `#2a2a2a` border.
- Typography: Anton (headings, uppercase) + Outfit (body) + Space Mono (overlines).
- Motion: IntersectionObserver fade-up reveals, marquee, cart bump animation, smooth scroll.

## What's Implemented (2026-04-28)
- 48-item seeded menu (potatoes, rolls, momos, chowmein, rice, main-course, chopsy) with veg/non-veg badges and half/full price variants.
- Hero with cinematic image, headline, CTAs, marquee, and rating.
- Menu page with category pills, search, responsive grid, animated cards, half/full toggle.
- Cart drawer (shadcn Sheet) with qty +/-, remove, free-delivery threshold (₹300+), live count badge, pulse animation.
- Checkout dialog with name/phone/address/notes, COD + Stripe Online tile, server-side price recompute.
- Stripe checkout flow: `/api/checkout/session` creates session and `payment_transactions` row; Success page polls `/api/checkout/status` (graceful fallback to last DB state).
- About section with 5.0 rating badge, services chips.
- Order info with timings, address, phone (tap-to-call), embedded Google Map (dark-filtered).
- Footer with social links and copyright.
- Admin (`/admin`, password `admin123`) — Orders tab (status pills) + Menu tab (CRUD, availability toggle).

## Test Results
- **Backend:** 17/17 endpoints passing (after `/api/checkout/status` graceful-fail fix).
- **Frontend:** 19/19 flows passing (Hero, Menu, filters, search, variants, cart, COD checkout, Stripe redirect, About, OrderInfo, Footer, Cancel, Admin login + orders + menu CRUD).

## Backlog (P1 / P2)
- P1: Admin auth via JWT/session cookie (currently password-only, endpoints not protected).
- P1: Order detail page with live status tracking for customers (`/order/{id}`).
- P1: Phone OTP verification + WhatsApp order confirmation (Twilio).
- P2: Coupons / promo codes, loyalty stamps.
- P2: Image uploads for menu admin (currently URL-only).
- P2: Real Google Maps API key for richer embed.
- P2: Reviews/testimonials submission form.
- P2: SEO/OG tags, sitemap, schema.org Restaurant markup.

## Test Credentials
See `/app/memory/test_credentials.md`.
