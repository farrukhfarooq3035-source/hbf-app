-- Order chat threads store conversation metadata per order/channel
CREATE TABLE IF NOT EXISTS order_chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'customer_support',
  created_by UUID,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  last_customer_message_at TIMESTAMPTZ,
  last_admin_message_at TIMESTAMPTZ,
  unread_for_admin BOOLEAN DEFAULT false,
  unread_for_customer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_order_chat_threads_order ON order_chat_threads(order_id);
CREATE INDEX IF NOT EXISTS idx_order_chat_threads_unread_admin ON order_chat_threads(unread_for_admin) WHERE unread_for_admin = true;

-- Individual chat messages tied to a thread
CREATE TABLE IF NOT EXISTS order_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES order_chat_threads(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin', 'rider', 'system')),
  sender_id UUID,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_chat_messages_thread ON order_chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_order_chat_messages_order ON order_chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_order_chat_messages_created ON order_chat_messages(created_at DESC);

-- Enable realtime streaming for chat payloads
ALTER PUBLICATION supabase_realtime ADD TABLE order_chat_messages;

-- Row Level Security
ALTER TABLE order_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies: customers can read/write only their own order threads
CREATE POLICY "Customers access own order chat threads"
  ON order_chat_threads
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.id = order_chat_threads.order_id
        AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create their order chat thread"
  ON order_chat_threads
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.id = order_chat_threads.order_id
        AND o.user_id = auth.uid()
    )
  );

-- Allow admins/service role to manage threads (service role bypasses RLS; this allows future client-side admin usage)
CREATE POLICY "Customers read own chat messages"
  ON order_chat_messages
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM order_chat_threads t
      JOIN orders o ON o.id = t.order_id
      WHERE t.id = order_chat_messages.thread_id
        AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers send chat messages"
  ON order_chat_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM order_chat_threads t
      JOIN orders o ON o.id = t.order_id
      WHERE t.id = order_chat_messages.thread_id
        AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage order chat threads"
  ON order_chat_threads
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can manage order chat messages"
  ON order_chat_messages
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

