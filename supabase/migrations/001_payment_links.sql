-- ============================================================
-- Migration 001: Support Razorpay Payment Links
-- Run in Supabase SQL Editor after the main schema.sql
-- ============================================================

-- 1. Make razorpay_order_id nullable (Payment Links don't have an order_id)
ALTER TABLE public.payments
  ALTER COLUMN razorpay_order_id DROP NOT NULL;

-- 2. Add payment link id column
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS razorpay_link_id TEXT;

-- 3. Expand status check to include link_requested
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('created', 'link_requested', 'paid', 'failed'));
