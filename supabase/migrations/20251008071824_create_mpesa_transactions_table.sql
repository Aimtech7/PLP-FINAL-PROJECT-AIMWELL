/*
  # M-Pesa Transactions Schema

  ## Overview
  This migration creates the necessary tables for handling M-Pesa Lipa Na M-Pesa (STK Push) payments.

  ## New Tables
  
  ### `mpesa_transactions`
  Stores all M-Pesa payment transaction records
  - `id` (uuid, primary key) - Unique transaction identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `phone_number` (text) - Customer phone number in format 254XXXXXXXXX
  - `amount` (decimal) - Transaction amount
  - `merchant_request_id` (text) - M-Pesa merchant request ID
  - `checkout_request_id` (text) - M-Pesa checkout request ID (unique)
  - `mpesa_receipt_number` (text, nullable) - M-Pesa receipt/transaction code
  - `transaction_date` (timestamptz, nullable) - Actual M-Pesa transaction timestamp
  - `result_code` (integer, nullable) - M-Pesa result code (0 = success)
  - `result_desc` (text, nullable) - M-Pesa result description
  - `status` (text) - Transaction status: pending, completed, failed, cancelled
  - `account_reference` (text) - Account reference/description
  - `transaction_desc` (text) - Transaction description
  - `metadata` (jsonb) - Additional transaction metadata
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Security
  - Enable RLS on `mpesa_transactions` table
  - Users can view their own transactions
  - Users can create their own transactions
  - Service role can manage all transactions

  ## Indexes
  - Index on user_id for fast user transaction lookups
  - Index on checkout_request_id for callback processing
  - Index on status for filtering
*/

-- Create mpesa_transactions table
CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number text NOT NULL,
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  merchant_request_id text,
  checkout_request_id text UNIQUE,
  mpesa_receipt_number text,
  transaction_date timestamptz,
  result_code integer,
  result_desc text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  account_reference text NOT NULL,
  transaction_desc text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_user_id ON mpesa_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_checkout_request_id ON mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_created_at ON mpesa_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON mpesa_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own transactions
CREATE POLICY "Users can create own transactions"
  ON mpesa_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mpesa_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_mpesa_transactions_updated_at_trigger
  BEFORE UPDATE ON mpesa_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_mpesa_transactions_updated_at();
