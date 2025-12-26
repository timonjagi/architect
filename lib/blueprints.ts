
import React from 'react';
import {
  Lock, CreditCard, Layout, Table2, BarChart, Settings2, BellRing, Store,
  PackageSearch, Truck, Users, Rocket, CheckCircle2, BrainCircuit,
  Layers, Briefcase, ShoppingBag, Bot, Megaphone, LayoutDashboard, Cpu,
  Quote, Target, HelpCircle, MailCheck, Building2, BookOpen, Link,
  Share2, Search, Zap, PieChart, Activity, Globe, ShieldAlert,
  Terminal, Workflow, Cloud, FlaskConical, Languages, Award, Repeat,
  Clock, Image, ShieldCheck, Database, MessagesSquare, MousePointer2,
  TrendingUp, FileSearch, FileCode, SearchCode, Mail, Box, Store as StoreIcon,
  UserPlus, Shield, Bell, ListChecks, TicketPercent, Star, Eye, Share,
  ShieldCheck as ShieldIcon, Key, Network, Gavel, Handshake, Glasses, Sparkles,
  FileJson, Cpu as CpuIcon, MessageSquare, UserCheck, Share2 as SocialIcon,
  CalendarDays,
  ClipboardCheck,
  Timer,
  UserRoundCheck
} from 'lucide-react';

export interface Blueprint {
  id: string;
  category: string;
  name: string;
  icon: React.ReactNode;
  prompt: string;
  badge: string;
  subcategories: { id: string; label: string; description: string }[];
}

export const CATEGORIES = [
  { id: 'all', label: 'All Modules', icon: React.createElement(Layers, { className: "w-4 h-4" }) },
  { id: 'saas', label: 'SaaS Core', icon: React.createElement(Briefcase, { className: "w-4 h-4" }) },
  { id: 'ecommerce', label: 'E-commerce', icon: React.createElement(ShoppingBag, { className: "w-4 h-4" }) },
  { id: 'booking', label: 'Services & Booking', icon: React.createElement(CalendarDays, { className: "w-4 h-4" }) },
  { id: 'social', label: 'Social & Collab', icon: React.createElement(Users, { className: "w-4 h-4" }) },
  { id: 'ai', label: 'AI & Data', icon: React.createElement(Bot, { className: "w-4 h-4" }) },
  { id: 'marketing', label: 'Marketing', icon: React.createElement(Megaphone, { className: "w-4 h-4" }) },
  { id: 'integrations', label: 'Integrations', icon: React.createElement(Link, { className: "w-4 h-4" }) },
  { id: 'application', label: 'Dashboards', icon: React.createElement(LayoutDashboard, { className: "w-4 h-4" }) },
  { id: 'system', label: 'Infrastructure', icon: React.createElement(Cpu, { className: "w-4 h-4" }) },
];

export const BLUEPRINTS: Blueprint[] = [
  // SaaS Core
  {
    id: 'auth-multi-tenant',
    category: 'saas',
    name: 'RBAC & Multi-Tenancy',
    icon: React.createElement(Lock, { className: "w-4 h-4" }),
    badge: 'Security',
    prompt: "Advanced multi-tenant authentication with Row Level Security and Role-Based Access Control.",
    subcategories: [
      { id: 'rls', label: 'Supabase RLS', description: 'Policy-driven data isolation per organization.' },
      { id: 'roles', label: 'Dynamic Roles', description: 'Admin, Member, and Viewer permission levels.' },
      { id: 'invites', label: 'Invite Engine', description: 'Token-based email invitations for teams.' }
    ]
  },
  {
    id: 'saas-billing',
    category: 'saas',
    name: 'Subscription Engine',
    icon: React.createElement(CreditCard, { className: "w-4 h-4" }),
    badge: 'Monetization',
    prompt: "Tiered subscription management with Stripe or LemonSqueezy integration.",
    subcategories: [
      { id: 'tiers', label: 'Pricing Plans', description: 'Support for Free, Pro, and Enterprise tiers.' },
      { id: 'webhooks', label: 'Stripe Webhooks', description: 'Listen for checkout.session.completed and subscriptions.' },
      { id: 'portal', label: 'Customer Portal', description: 'Self-serve billing management for users.' }
    ]
  },
  {
    id: 'saas-workspaces',
    category: 'saas',
    name: 'Workspace Logic',
    icon: React.createElement(Building2, { className: "w-4 h-4" }),
    badge: 'Organization',
    prompt: "Logical separation of data into workspaces/projects within a single organization.",
    subcategories: [
      { id: 'slugs', label: 'Subdomains/Slugs', description: 'Dynamic routing based on workspace identifiers.' },
      { id: 'transfer', label: 'Resource Transfer', description: 'Workflows for moving projects between workspaces.' },
      { id: 'isolation', label: 'Domain Isolation', description: 'Enforcing workspace-specific branding.' }
    ]
  },
  {
    id: 'saas-entitlements',
    category: 'saas',
    name: 'Feature Entitlements',
    icon: React.createElement(Key, { className: "w-4 h-4" }),
    badge: 'Entitlements',
    prompt: "Granular control over feature access based on subscription tiers and usage quotas.",
    subcategories: [
      { id: 'gates', label: 'Feature Gating', description: 'Logic to disable UI/API based on user plan.' },
      { id: 'quotas', label: 'Usage Quotas', description: 'Tracking and enforcing limits (e.g., project counts).' },
      { id: 'addons', label: 'Add-on Logic', description: 'Unlocking modules independently of the main tier.' }
    ]
  },
  {
    id: 'saas-compliance',
    category: 'saas',
    name: 'Audit & Compliance',
    icon: React.createElement(ShieldIcon, { className: "w-4 h-4" }),
    badge: 'Enterprise',
    prompt: "Enterprise-grade activity logging for regulatory requirements (SOC2/HIPAA).",
    subcategories: [
      { id: 'logging', label: 'Activity Streams', description: 'Immutable log of every sensitive action taken by users.' },
      { id: 'retention', label: 'Data Retention', description: 'Automated cleanup and archival policies for logs.' },
      { id: 'mfa', label: 'Enforced MFA', description: 'Organization-wide requirement for multi-factor authentication.' }
    ]
  },
  {
    id: 'saas-webhooks-sys',
    category: 'saas',
    name: 'Webhook Orchestration',
    icon: React.createElement(Network, { className: "w-4 h-4" }),
    badge: 'Automation',
    prompt: "Inbound and outbound webhook systems for third-party developer integrations.",
    subcategories: [
      { id: 'outgoing', label: 'Event Broadcast', description: 'System for users to subscribe their own URLs to app events.' },
      { id: 'signing', label: 'Payload Signing', description: 'Security layer (HMAC) to ensure webhook authenticity.' },
      { id: 'retry', label: 'Retry Queues', description: 'Handling delivery failures with exponential backoff.' }
    ]
  },

  // E-commerce
  {
    id: 'eco-catalog',
    category: 'ecommerce',
    name: 'Product Discovery',
    icon: React.createElement(Store, { className: "w-4 h-4" }),
    badge: 'Storefront',
    prompt: "Browsing and search experience for product catalogs.",
    subcategories: [
      { id: 'filters', label: 'Faceted Filters', description: 'Filtering by size, color, price, and category.' },
      { id: 'grid', label: 'Smart Grids', description: 'Lazy-loading or paginated layouts.' },
      { id: 'search', label: 'Instant Search', description: 'Type-ahead suggestions and keyword matching.' }
    ]
  },
  {
    id: 'eco-checkout',
    category: 'ecommerce',
    name: 'Checkout Funnel',
    icon: React.createElement(Truck, { className: "w-4 h-4" }),
    badge: 'Conversion',
    prompt: "Optimized multi-step flow from cart to confirmation.",
    subcategories: [
      { id: 'cart', label: 'Persistent Cart', description: 'Session-synced cart with promo code logic.' },
      { id: 'flow', label: 'Multi-step Pay', description: 'Shipping, address validation, and payment.' },
      { id: 'upsell', label: 'Cross-selling', description: 'In-cart product recommendations.' }
    ]
  },
  {
    id: 'eco-escrow-p2p',
    category: 'ecommerce',
    name: 'C2C Escrow System',
    icon: React.createElement(Handshake, { className: "w-4 h-4" }),
    badge: 'Trust',
    prompt: "Secure peer-to-peer transaction logic where funds are held until delivery is confirmed.",
    subcategories: [
      { id: 'release', label: 'Milestone Release', description: 'Funds released only after buyer marks item as received.' },
      { id: 'dispute', label: 'Dispute Resolution', description: 'Admin mediation flow for handling transaction conflicts.' },
      { id: 'fees', label: 'Platform Commission', description: 'Automated fee deduction during the payout phase.' }
    ]
  },
  {
    id: 'eco-auctions-live',
    category: 'ecommerce',
    name: 'Live Auctions',
    icon: React.createElement(Gavel, { className: "w-4 h-4" }),
    badge: 'Real-time',
    prompt: "High-concurrency bidding engine for time-sensitive product auctions.",
    subcategories: [
      { id: 'sockets', label: 'Real-time Bidding', description: 'Websocket-based price updates without page refreshes.' },
      { id: 'timer', label: 'Dynamic Countdown', description: 'Server-side authoritative clock for auction expiration.' },
      { id: 'auto-bid', label: 'Proxy Bidding', description: 'Logic for users to set "max bids" and auto-increase.' }
    ]
  },
  {
    id: 'eco-inventory',
    category: 'ecommerce',
    name: 'Inventory & SKU Logic',
    icon: React.createElement(Box, { className: "w-4 h-4" }),
    badge: 'Operations',
    prompt: "Real-time stock tracking and inventory management across multiple warehouses.",
    subcategories: [
      { id: 'alerts', label: 'Low-stock Alerts', description: 'Automated notifications for reorder points.' },
      { id: 'sku', label: 'SKU Variation MGMT', description: 'Logic for sizes, colors, and variations.' },
      { id: 'history', label: 'Stock History', description: 'Audit trail for every stock change.' }
    ]
  },
  {
    id: 'eco-multi-vendor',
    category: 'ecommerce',
    name: 'Marketplace Engine',
    icon: React.createElement(StoreIcon, { className: "w-4 h-4" }),
    badge: 'Marketplace',
    prompt: "Multi-vendor orchestration including seller onboarding and commission splitting.",
    subcategories: [
      { id: 'payouts', label: 'Automated Payouts', description: 'Stripe Connect logic for splitting funds.' },
      { id: 'seller-dash', label: 'Vendor Portal', description: 'Dedicated dashboard for sellers.' },
      { id: 'approval', label: 'Product Verification', description: 'Admin workflow for reviewing listings.' }
    ]
  },
  {
    id: 'eco-discounts',
    category: 'ecommerce',
    name: 'Loyalty & Coupons',
    icon: React.createElement(TicketPercent, { className: "w-4 h-4" }),
    badge: 'Growth',
    prompt: "Advanced discount engine for complex promotional campaigns.",
    subcategories: [
      { id: 'coupons', label: 'Stacked Coupons', description: 'Logic for preventing or allowing multiple discount code usage.' },
      { id: 'tiered', label: 'Quantity Discounts', description: 'Automatic price drops based on item count.' },
      { id: 'referral', label: 'Referral Credits', description: 'User-to-user invite bonuses.' }
    ]
  },
  {
    id: 'eco-reviews',
    category: 'ecommerce',
    name: 'UGC & Social Proof',
    icon: React.createElement(Star, { className: "w-4 h-4" }),
    badge: 'Trust',
    prompt: "Customer review system with image uploads and verified purchase badges.",
    subcategories: [
      { id: 'verified', label: 'Verified Badges', description: 'Automatic check ensuring reviewer purchased the SKU.' },
      { id: 'ugc', label: 'Media Reviews', description: 'Uploading product photos in reviews.' },
      { id: 'vote', label: 'Helpfulness Voting', description: 'Social ranking logic for feedback.' }
    ]
  },

  {
    id: 'book-engine',
    category: 'booking',
    name: 'Booking Logic',
    icon: React.createElement(CalendarDays, { className: "w-4 h-4" }),
    badge: 'Core Engine',
    prompt: "Advanced scheduling system with multi-timezone support, slot availability logic, and buffer times.",
    subcategories: [
      { id: 'slots', label: 'Slot Generation', description: 'Dynamic calculation of available windows based on staff schedules.' },
      { id: 'buffer', label: 'Buffer Times', description: 'Preventing back-to-back bookings with automatic gap insertion.' },
      { id: 'timezone', label: 'Global Booking', description: 'Auto-conversion of slots to user browser timezone.' }
    ]
  },
  {
    id: 'book-marketplace',
    category: 'booking',
    name: 'Service Marketplace',
    icon: React.createElement(UserRoundCheck, { className: "w-4 h-4" }),
    badge: 'Platform',
    prompt: "A marketplace infrastructure for service providers (e.g., consultants, therapists, housekeepers).",
    subcategories: [
      { id: 'listing', label: 'Provider Listings', description: 'Rich profiles with portfolios, services offered, and dynamic pricing.' },
      { id: 'approval', label: 'Vetting Workflow', description: 'Admin pipeline for reviewing and approving new providers.' },
      { id: 'comm', label: 'Escrow Payouts', description: 'Holding funds until service delivery is confirmed by the client.' }
    ]
  },
  {
    id: 'book-availability',
    category: 'booking',
    name: 'Availability Management',
    icon: React.createElement(Timer, { className: "w-4 h-4" }),
    badge: 'Operations',
    prompt: "Provider-facing tools to manage work hours, holidays, and sync with external calendars (iCal/Google).",
    subcategories: [
      { id: 'cal-sync', label: 'External Sync', description: 'Two-way synchronization with Google Calendar or Outlook.' },
      { id: 'recurring', label: 'Recurring Shifts', description: 'Setting weekly availability patterns (e.g., Mon-Fri 9-5).' },
      { id: 'exceptions', label: 'Blackout Dates', description: 'One-off availability overrides for vacations or sick leave.' }
    ]
  },
  {
    id: 'book-appointments',
    category: 'booking',
    name: 'Appointment Flow',
    icon: React.createElement(ClipboardCheck, { className: "w-4 h-4" }),
    badge: 'Conversion',
    prompt: "End-to-end user experience for selecting, paying for, and managing appointments.",
    subcategories: [
      { id: 'intake', label: 'Intake Forms', description: 'Customizable questionnaires to gather info before the session.' },
      { id: 'resched', label: 'Self-Service Rebooking', description: 'Allowing users to move appointments based on provider rules.' },
      { id: 'reminders', label: 'Automated Reminders', description: 'SMS/Email alerts 24h and 1h before the start time.' }
    ]
  },
  {
    id: 'book-reviews',
    category: 'booking',
    name: 'Reputation & Trust',
    icon: React.createElement(Award, { className: "w-4 h-4" }),
    badge: 'Retention',
    prompt: "Verified review system for services with specific metrics (e.g., punctuality, quality, value).",
    subcategories: [
      { id: 'metrics', label: 'Performance Metrics', description: 'Quantifiable scores calculated from user feedback.' },
      { id: 'badges', label: 'Trust Badges', description: 'Automatic highlighting of "Top Rated" or "Fast Responder".' },
      { id: 'verified', label: 'Purchase Lock', description: 'Strict validation ensuring only paying clients can leave feedback.' }
    ]
  },
  // Social & Collaboration
  {
    id: 'soc-activity-feed',
    category: 'social',
    name: 'Social Feed Engine',
    icon: React.createElement(Repeat, { className: "w-4 h-4" }),
    badge: 'Engagement',
    prompt: "Dynamic newsfeed with personalized ranking and multi-format post support.",
    subcategories: [
      { id: 'ranking', label: 'Edge-based Ranking', description: 'Personalized content delivery based on user interest.' },
      { id: 'reactions', label: 'Rich Reactions', description: 'Handling diverse interaction types (likes, claps, custom emojis).' },
      { id: 'fanout', label: 'Write-ahead Fanout', description: 'High-performance post distribution to followers.' }
    ]
  },
  {
    id: 'soc-realtime-chat',
    category: 'social',
    name: 'Messaging Infrastructure',
    icon: React.createElement(MessageSquare, { className: "w-4 h-4" }),
    badge: 'Real-time',
    prompt: "Scalable direct and group messaging with read receipts and media attachments.",
    subcategories: [
      { id: 'threading', label: 'Message Threads', description: 'Logic for nested conversations and replies.' },
      { id: 'receipts', label: 'Read Receipts', description: 'Real-time tracking of message status (sent, delivered, read).' },
      { id: 'presence', label: 'Typing Indicators', description: 'Ephemeral socket events for active user states.' }
    ]
  },
  {
    id: 'soc-presence-sys',
    category: 'social',
    name: 'Presence & Status',
    icon: React.createElement(UserCheck, { className: "w-4 h-4" }),
    badge: 'Connectivity',
    prompt: "System for tracking 'online' status and device-specific presence across the app.",
    subcategories: [
      { id: 'heartbeat', label: 'Heartbeat Logic', description: 'Server-side detection of disconnected clients.' },
      { id: 'devices', label: 'Multi-device Sync', description: 'Merging status across web, mobile, and desktop.' },
      { id: 'custom-status', label: 'Custom Status', description: 'Persistence for "Busy", "Away", or custom text status.' }
    ]
  },
  {
    id: 'soc-social-graph',
    category: 'social',
    name: 'Relationship Graph',
    icon: React.createElement(SocialIcon, { className: "w-4 h-4" }),
    badge: 'Network',
    prompt: "Advanced follower/following logic with mutual friend detection and blocking.",
    subcategories: [
      { id: 'mutuals', label: 'Mutual Discovery', description: 'Logic for identifying common connections.' },
      { id: 'blocking', label: 'Privacy Hardening', description: 'Enforcing strict content hiding for blocked users.' },
      { id: 'mentions', label: 'Mentions Index', description: 'Parsing and notifying @users in content bodies.' }
    ]
  },
  {
    id: 'soc-collab-editing',
    category: 'social',
    name: 'Collaborative Spaces',
    icon: React.createElement(MousePointer2, { className: "w-4 h-4" }),
    badge: 'Productivity',
    prompt: "Shared workspaces with real-time cursor tracking and CRDT-based conflict resolution.",
    subcategories: [
      { id: 'cursors', label: 'Live Cursors', description: 'Low-latency broadcast of active user mouse positions.' },
      { id: 'crdt', label: 'Conflict Resolution', description: 'Yjs or Automerge integration for multi-player editing.' },
      { id: 'versioning', label: 'Live History', description: 'Visual timeline of changes made by different collaborators.' }
    ]
  },

  // AI & Data
  {
    id: 'ai-rag-pipeline',
    category: 'ai',
    name: 'Knowledge RAG',
    icon: React.createElement(BrainCircuit, { className: "w-4 h-4" }),
    badge: 'Intelligence',
    prompt: "Retrieval Augmented Generation pipeline for chatting with custom datasets.",
    subcategories: [
      { id: 'embeddings', label: 'Vector Embeddings', description: 'Chunking and storage in pgvector or Pinecone.' },
      { id: 'search', label: 'Semantic Search', description: 'Contextual retrieval based on query similarity.' },
      { id: 'stream', label: 'Chat Streaming', description: 'Real-time UI updates for model responses.' }
    ]
  },
  {
    id: 'ai-agent-orchestrator',
    category: 'ai',
    name: 'Agent Orchestration',
    icon: React.createElement(CpuIcon, { className: "w-4 h-4" }),
    badge: 'Automation',
    prompt: "Autonomous agent system capable of planning, tool use, and recursive task execution.",
    subcategories: [
      { id: 'planning', label: 'Plan & Execute', description: 'LLM logic to break goals into sub-tasks.' },
      { id: 'tools', label: 'Function Calling', description: 'Standardized tool interfaces.' },
      { id: 'memory', label: 'Contextual Memory', description: 'Short-term and long-term state persistence.' }
    ]
  },
  {
    id: 'ai-data-extraction',
    category: 'ai',
    name: 'Structured Extraction',
    icon: React.createElement(FileJson, { className: "w-4 h-4" }),
    badge: 'Parsing',
    prompt: "Transforming unstructured text or PDFs into strictly validated JSON schemas using LLMs.",
    subcategories: [
      { id: 'zod', label: 'Schema Validation', description: 'Zod/Pydantic integration for output integrity.' },
      { id: 'batch', label: 'Batch Processing', description: 'Orchestrating large-scale document parsing.' },
      { id: 'mapping', label: 'Field Mapping', description: 'Intelligent normalization of varied source data fields.' }
    ]
  },
  {
    id: 'ai-multimodal-vision',
    category: 'ai',
    name: 'Multimodal Vision',
    icon: React.createElement(Glasses, { className: "w-4 h-4" }),
    badge: 'Perception',
    prompt: "Image and video analysis workflows for automated tagging, captioning, or OCR.",
    subcategories: [
      { id: 'tagging', label: 'Auto-Tagging', description: 'Generating metadata from visual inputs.' },
      { id: 'ocr', label: 'Visual Data Parsing', description: 'Extracting complex table data from images.' },
      { id: 'qc', label: 'Visual QA', description: 'Automated quality checks or anomaly detection.' }
    ]
  },

  // Marketing
  {
    id: 'mkt-hero',
    category: 'marketing',
    name: 'Conversion Hero',
    icon: React.createElement(Rocket, { className: "w-4 h-4" }),
    badge: 'Landing',
    prompt: "High-impact hero section with clear CTAs and social proof.",
    subcategories: [
      { id: 'split', label: 'Split Layout', description: 'Visual on one side, copy on the other.' },
      { id: 'centered', label: 'Centered Stack', description: 'Impactful centered typography.' },
      { id: 'video-bg', label: 'Video Ambient', description: 'Muted background video loops.' }
    ]
  },
  {
    id: 'mkt-features',
    category: 'marketing',
    name: 'Feature Showcase',
    icon: React.createElement(CheckCircle2, { className: "w-4 h-4" }),
    badge: 'Product',
    prompt: "Comprehensive feature grids and detailed capability sections.",
    subcategories: [
      { id: 'grid', label: 'Icon Grid', description: 'Responsive grid with descriptions.' },
      { id: 'side-by-side', label: 'Detailed Rows', description: 'Alternating image/text rows.' },
      { id: 'tabs', label: 'Feature Tabs', description: 'Switchable content views.' }
    ]
  },
  {
    id: 'mkt-blog-mdx',
    category: 'marketing',
    name: 'SEO Blog System',
    icon: React.createElement(BookOpen, { className: "w-4 h-4" }),
    badge: 'Content',
    prompt: "Full-featured blog system with MDX support and high lighthouse scores.",
    subcategories: [
      { id: 'mdx', label: 'MDX Content', description: 'Server-side rendered markdown with custom components.' },
      { id: 'social', label: 'OG Tags', description: 'Automated OpenGraph image generation.' },
      { id: 'newsletter', label: 'Opt-ins', description: 'Lead capture forms in the reading flow.' }
    ]
  },
  {
    id: 'mkt-pricing-dynamic',
    category: 'marketing',
    name: 'Pricing Strategy',
    icon: React.createElement(Target, { className: "w-4 h-4" }),
    badge: 'Sales',
    prompt: "Conversion-optimized pricing tables with complex logic.",
    subcategories: [
      { id: 'toggle', label: 'Bill Cycle Toggle', description: 'Monthly vs Annual with discount visualizer.' },
      { id: 'faq', label: 'Price-Context FAQ', description: 'Accordion-style answers for billing.' },
      { id: 'comparison', label: 'Feature Matrix', description: 'Deep comparison table for plans.' }
    ]
  },
  {
    id: 'mkt-social-proof',
    category: 'marketing',
    name: 'Trust Ecosystem',
    icon: React.createElement(Quote, { className: "w-4 h-4" }),
    badge: 'Authority',
    prompt: "High-trust sections showcasing customers and validation.",
    subcategories: [
      { id: 'wall', label: 'Testimonial Wall', description: 'Masonry grid of customer quotes.' },
      { id: 'logos', label: 'Client Logos', description: 'Animated grayscale logo bar.' },
      { id: 'stats', label: 'Impact Metrics', description: 'Animated count-up numbers.' }
    ]
  },
  {
    id: 'mkt-seo-automation',
    category: 'marketing',
    name: 'SEO Performance Kit',
    icon: React.createElement(FileSearch, { className: "w-4 h-4" }),
    badge: 'Organic',
    prompt: "Technical SEO infrastructure for maximum indexability.",
    subcategories: [
      { id: 'metadata', label: 'Dynamic Metadata', description: 'Server-side injected meta tags.' },
      { id: 'sitemap', label: 'Auto-Sitemaps', description: 'Dynamic sitemap.xml generation.' },
      { id: 'og', label: 'Social Cards', description: 'Automated generation of social images.' }
    ]
  },
  {
    id: 'mkt-ab-testing',
    category: 'marketing',
    name: 'Experimentation Framework',
    icon: React.createElement(FlaskConical, { className: "w-4 h-4" }),
    badge: 'Growth',
    prompt: "A/B testing architecture for optimizing conversion rates.",
    subcategories: [
      { id: 'middleware', label: 'Edge Middleware', description: 'Zero-latency variant assignment.' },
      { id: 'analytics', label: 'Experiment Analytics', description: 'Tracking confidence scores.' },
      { id: 'overrides', label: 'Manual Overrides', description: 'Admin controls for QA.' }
    ]
  },
  {
    id: 'mkt-onboarding',
    category: 'marketing',
    name: 'User Onboarding Flow',
    icon: React.createElement(MousePointer2, { className: "w-4 h-4" }),
    badge: 'Retention',
    prompt: "Guided tours and progression-based onboarding.",
    subcategories: [
      { id: 'checklists', label: 'Setup Checklists', description: 'Gamified progress bars for tasks.' },
      { id: 'tours', label: 'Contextual Tours', description: 'Floating tooltips guiding users.' },
      { id: 'completion', label: 'Milestone Events', description: 'Triggering rewards upon completion.' }
    ]
  },

  // Integrations
  {
    id: 'int-crm-bridge',
    category: 'integrations',
    name: 'CRM Automations',
    icon: React.createElement(Building2, { className: "w-4 h-4" }),
    badge: 'Operations',
    prompt: "Syncing application data with external CRM platforms like Hubspot or Salesforce.",
    subcategories: [
      { id: 'leads', label: 'Lead Capture', description: 'Syncing signup events to CRM.' },
      { id: 'sync', label: 'Two-way Sync', description: 'Updates between DB and customer records.' },
      { id: 'tracking', label: 'Deal Pipelines', description: 'Automated deal creation.' }
    ]
  },
  {
    id: 'int-product-analytics',
    category: 'integrations',
    name: 'Product Insights',
    icon: React.createElement(Activity, { className: "w-4 h-4" }),
    badge: 'Analytics',
    prompt: "Deep event tracking with Posthog, Mixpanel, or Amplitude.",
    subcategories: [
      { id: 'events', label: 'Auto-Capture', description: 'Universal event listener.' },
      { id: 'feature-flags', label: 'Flags & Toggles', description: 'Control features per user segment.' },
      { id: 'identity', label: 'User Identity', description: 'Merging anonymous and authenticated profiles.' }
    ]
  },
  {
    id: 'int-search-indexing',
    category: 'integrations',
    name: 'Global Search',
    icon: React.createElement(Search, { className: "w-4 h-4" }),
    badge: 'Discovery',
    prompt: "High-performance full-text search with Algolia or Elasticsearch.",
    subcategories: [
      { id: 'sync', label: 'Indexer Sync', description: 'Keeping search indices fresh.' },
      { id: 'filters', label: 'Instant Filters', description: 'Real-time faceting.' },
      { id: 'geo', label: 'Geo-spatial Search', description: 'Location-aware results.' }
    ]
  },
  {
    id: 'int-lifecycle-email',
    category: 'integrations',
    name: 'Email Lifecycles',
    icon: React.createElement(Mail, { className: "w-4 h-4" }),
    badge: 'Retention',
    prompt: "Automated communication flows using Resend, Sendgrid, or Braze.",
    subcategories: [
      { id: 'transactional', label: 'Templates', description: 'Code-first email templates.' },
      { id: 'drip', label: 'Engagement Drip', description: 'Sequence-based engagement logic.' },
      { id: 'churn', label: 'Win-back Flows', description: 'Automated outreach for inactive users.' }
    ]
  },
  {
    id: 'int-payment-orchestration',
    category: 'integrations',
    name: 'Payment Orchestration',
    icon: React.createElement(TrendingUp, { className: "w-4 h-4" }),
    badge: 'Finance',
    prompt: "Unified API for multiple payment providers (Stripe, PayPal, Adyen).",
    subcategories: [
      { id: 'failover', label: 'Smart Failover', description: 'Automatic provider switching.' },
      { id: 'unified', label: 'Unified Schema', description: 'Standardizing response objects.' },
      { id: 'tax', label: 'Tax Calculation', description: 'Stripe Tax or Avalara compliance.' }
    ]
  },
  {
    id: 'int-support-desk',
    category: 'integrations',
    name: 'Support Integration',
    icon: React.createElement(MessagesSquare, { className: "w-4 h-4" }),
    badge: 'Success',
    prompt: "Syncing application data with support tools like Intercom or Zendesk.",
    subcategories: [
      { id: 'identity', label: 'Identity Mapping', description: 'Mapping app users to support tickets.' },
      { id: 'widget', label: 'Custom Sidebar', description: 'Visualizing app-data inside support agent UI.' },
      { id: 'bots', label: 'Knowledge Sync', description: 'Syncing docs to support AI bots.' }
    ]
  },

  // Dashboards (Application)
  {
    id: 'app-nav',
    category: 'application',
    name: 'Application Shell',
    icon: React.createElement(Layout, { className: "w-4 h-4" }),
    badge: 'Navigation',
    prompt: "Primary application structure with sidebars and global navigation.",
    subcategories: [
      { id: 'sidebar', label: 'Sidebar', description: 'Multi-level navigation.' },
      { id: 'command', label: 'Command Bar', description: 'Global quick action palette.' },
      { id: 'header', label: 'Header', description: 'Dynamic breadcrumbs and user menu.' }
    ]
  },
  {
    id: 'app-tables',
    category: 'application',
    name: 'Data Management',
    icon: React.createElement(Table2, { className: "w-4 h-4" }),
    badge: 'Admin',
    prompt: "Feature-rich data grids for managing complex resources.",
    subcategories: [
      { id: 'filters', label: 'Faceted Search', description: 'Advanced filtering and sorted views.' },
      { id: 'bulk', label: 'Bulk Actions', description: 'Multi-select logic for processing.' },
      { id: 'inline', label: 'Inline Editing', description: 'Direct field updates.' }
    ]
  },
  {
    id: 'app-dashboards',
    category: 'application',
    name: 'Analytics Panels',
    icon: React.createElement(BarChart, { className: "w-4 h-4" }),
    badge: 'Insights',
    prompt: "Visual data representation and metric tracking dashboards.",
    subcategories: [
      { id: 'stats', label: 'KPI Grid', description: 'Snapshot cards with trend indicators.' },
      { id: 'charts', label: 'Interactive Charts', description: 'TimeSeries and Pie charts.' },
      { id: 'activity', label: 'Activity Feed', description: 'Real-time event log.' }
    ]
  },
  {
    id: 'app-user-admin',
    category: 'application',
    name: 'User & Team Control',
    icon: React.createElement(UserPlus, { className: "w-4 h-4" }),
    badge: 'Access',
    prompt: "Comprehensive user management dashboard for admins to manage teams and seats.",
    subcategories: [
      { id: 'seats', label: 'Seat Management', description: 'Managing user slots per plan.' },
      { id: 'impersonate', label: 'User Impersonation', description: 'Admin ability to view the app as a customer.' },
      { id: 'status', label: 'Invite Tracking', description: 'Dashboard view for invites.' }
    ]
  },
  {
    id: 'app-audit-logs',
    category: 'application',
    name: 'Security & Audit',
    icon: React.createElement(Shield, { className: "w-4 h-4" }),
    badge: 'Compliance',
    prompt: "Immutable event logging for security monitoring and regulatory compliance.",
    subcategories: [
      { id: 'events', label: 'Event Streaming', description: 'Real-time logging of sensitive actions.' },
      { id: 'export', label: 'Audit Exports', description: 'Generating CSV/PDF reports for auditors.' },
      { id: 'geo', label: 'IP & Geo Logging', description: 'Tracking action origins.' }
    ]
  },
  {
    id: 'app-settings-hub',
    category: 'application',
    name: 'Config & API Keys',
    icon: React.createElement(Settings2, { className: "w-4 h-4" }),
    badge: 'Control',
    prompt: "Centralized settings hub for user preferences and developer API management.",
    subcategories: [
      { id: 'api-keys', label: 'API Key MGMT', description: 'Generate and revoke secret keys.' },
      { id: 'preferences', label: 'Theming', description: 'UI preference persistence logic.' },
      { id: 'webhooks-out', label: 'Outgoing Webhooks', description: 'User-defined URLs to receive events.' }
    ]
  },
  {
    id: 'app-notif-center',
    category: 'application',
    name: 'Notification Center',
    icon: React.createElement(Bell, { className: "w-4 h-4" }),
    badge: 'Inbox',
    prompt: "In-app notification hub for tracking system alerts and mentions.",
    subcategories: [
      { id: 'read-state', label: 'Unread Sync', description: 'Persistence for unread counts.' },
      { id: 'priority', label: 'Urgency Levels', description: 'Visual ranking of notifications.' },
      { id: 'preferences', label: 'Channel Toggles', description: 'User controls for alert types.' }
    ]
  },

  // Infrastructure (System)
  {
    id: 'sys-distributed-cache',
    category: 'system',
    name: 'Distributed Caching',
    icon: React.createElement(Zap, { className: "w-4 h-4" }),
    badge: 'Performance',
    prompt: "High-performance caching layer using Redis or Upstash.",
    subcategories: [
      { id: 'rate-limit', label: 'Rate Limiting', description: 'Protect endpoints from abuse.' },
      { id: 'session', label: 'Session Store', description: 'Fast session management.' },
      { id: 'pubsub', label: 'Real-time Pub/Sub', description: 'Socket sync and notifications.' }
    ]
  },
  {
    id: 'sys-task-queues',
    category: 'system',
    name: 'Asynchronous Tasks',
    icon: React.createElement(Clock, { className: "w-4 h-4" }),
    badge: 'Scalability',
    prompt: "Background job processing and task orchestration.",
    subcategories: [
      { id: 'retry', label: 'Retry Policies', description: 'Exponential backoff management.' },
      { id: 'cron', label: 'Scheduled Crons', description: 'Recurring reports and cleanup.' },
      { id: 'fan-out', label: 'Task Fan-out', description: 'Parallelizing large batches of work.' }
    ]
  },
  {
    id: 'sys-media-infra',
    category: 'system',
    name: 'Media Pipeline',
    icon: React.createElement(Image, { className: "w-4 h-4" }),
    badge: 'Asset MGMT',
    prompt: "Infrastructure for handling, optimizing, and delivering user media.",
    subcategories: [
      { id: 'upload', label: 'Direct Uploads', description: 'Presigned URL patterns.' },
      { id: 'optimize', label: 'Image Optimization', description: 'On-the-fly resizing and conversion.' },
      { id: 'video', label: 'Video Transcoding', description: 'Integration with Mux for streaming.' }
    ]
  },
  {
    id: 'sys-observability',
    category: 'system',
    name: 'Observability Suite',
    icon: React.createElement(Activity, { className: "w-4 h-4" }),
    badge: 'Reliability',
    prompt: "Comprehensive monitoring, logging, and tracing.",
    subcategories: [
      { id: 'tracing', label: 'Distributed Tracing', description: 'OpenTelemetry integration.' },
      { id: 'errors', label: 'Error Reporting', description: 'Sentry/LogRocket setup.' },
      { id: 'metrics', label: 'Custom SLIs', description: 'Prometheus hooks for business monitoring.' }
    ]
  },
  {
    id: 'sys-cicd-infra',
    category: 'system',
    name: 'CI/CD Pipelines',
    icon: React.createElement(Workflow, { className: "w-4 h-4" }),
    badge: 'DevOps',
    prompt: "Automated testing and deployment workflows.",
    subcategories: [
      { id: 'stages', label: 'Multi-stage Builds', description: 'Staging and Production gates.' },
      { id: 'iac', label: 'Infra-as-Code', description: 'Terraform modules for environments.' },
      { id: 'preview', label: 'Preview Deploys', description: 'Environment spinning for PRs.' }
    ]
  }
];
