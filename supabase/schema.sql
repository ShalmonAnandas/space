-- Supabase SQL Schema for Space app
-- Run this in the Supabase SQL Editor to create all tables

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spaces table
CREATE TABLE IF NOT EXISTS "Space" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "userId1" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "userId2" UUID REFERENCES "User"(id) ON DELETE SET NULL,
  "suttaEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_space_users ON "Space"("userId1", "userId2");

-- Invites table
CREATE TABLE IF NOT EXISTS "Invite" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "spaceId" UUID UNIQUE NOT NULL REFERENCES "Space"(id) ON DELETE CASCADE,
  "creatorId" UUID NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push Subscriptions table
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  id SERIAL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  UNIQUE("userId", subscription)
);
CREATE INDEX IF NOT EXISTS idx_push_sub_user ON "PushSubscription"("userId");

-- Notice table
CREATE TABLE IF NOT EXISTS "Notice" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "spaceId" UUID NOT NULL REFERENCES "Space"(id) ON DELETE CASCADE,
  "authorId" UUID NOT NULL REFERENCES "User"(id),
  content TEXT NOT NULL,
  seen BOOLEAN NOT NULL DEFAULT false,
  "isEdited" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notice_space ON "Notice"("spaceId");
CREATE INDEX IF NOT EXISTS idx_notice_space_created ON "Notice"("spaceId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_notice_space_author_seen ON "Notice"("spaceId", "authorId", seen);

-- Gossip table
CREATE TABLE IF NOT EXISTS "Gossip" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "spaceId" UUID NOT NULL REFERENCES "Space"(id) ON DELETE CASCADE,
  "authorId" UUID NOT NULL REFERENCES "User"(id),
  content TEXT NOT NULL,
  seen BOOLEAN NOT NULL DEFAULT false,
  reacted BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gossip_space ON "Gossip"("spaceId");
CREATE INDEX IF NOT EXISTS idx_gossip_space_author_reacted ON "Gossip"("spaceId", "authorId", reacted, "createdAt");

-- Mood table
CREATE TABLE IF NOT EXISTS "Mood" (
  id SERIAL PRIMARY KEY,
  "spaceId" UUID NOT NULL REFERENCES "Space"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User"(id),
  mood TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mood_space_user_created ON "Mood"("spaceId", "userId", "createdAt");

-- DailyClick table
CREATE TABLE IF NOT EXISTS "DailyClick" (
  id SERIAL PRIMARY KEY,
  "spaceId" UUID NOT NULL REFERENCES "Space"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User"(id),
  type TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_daily_click_user_type_created ON "DailyClick"("userId", type, "createdAt");

-- NotificationQueue table
CREATE TABLE IF NOT EXISTS "NotificationQueue" (
  id SERIAL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "spaceId" UUID NOT NULL REFERENCES "Space"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notification_user_read ON "NotificationQueue"("userId", read);
