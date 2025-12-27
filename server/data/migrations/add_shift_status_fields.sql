-- Migration: Add status tracking fields to ShiftAssignments
-- Date: 2025-12-27
-- Description: Adds status, rejection_reason, alternative_preferences, and response_date
--              columns to enable users to accept/decline shift assignments

ALTER TABLE ShiftAssignments ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE ShiftAssignments ADD COLUMN rejection_reason TEXT;
ALTER TABLE ShiftAssignments ADD COLUMN alternative_preferences TEXT;
ALTER TABLE ShiftAssignments ADD COLUMN response_date TEXT;

-- Update existing records to have 'pending' status
UPDATE ShiftAssignments SET status = 'pending' WHERE status IS NULL;