-- ============================================================
-- Life OS — Database Schema (Documentation Only)
-- ============================================================
-- This file documents the current Supabase database schema.
-- It is NOT meant to be run against a live database.
-- Source of truth: Supabase Dashboard
-- Last updated: 2026-05-01
-- ============================================================


-- ============================================================
-- TABLES
-- ============================================================

-- Core OS table — one per user per device type
CREATE TABLE public.life_os (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  created_at  timestamp   NOT NULL DEFAULT now(),
  user_id     uuid        NULL     DEFAULT auth.uid(),
  device_type text        NOT NULL,
  is_temporary boolean    NOT NULL DEFAULT true,

  CONSTRAINT life_os_pkey PRIMARY KEY (id),
  CONSTRAINT life_os_user_device_unique UNIQUE (user_id, device_type)
) TABLESPACE pg_default;


-- Folders belong to an OS
CREATE TABLE public.folders (
  id    uuid NOT NULL DEFAULT gen_random_uuid(),
  os_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name  text NOT NULL,

  CONSTRAINT folders_pkey PRIMARY KEY (id),
  CONSTRAINT folders_os_id_fkey FOREIGN KEY (os_id)
    REFERENCES life_os (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS folders_os_id_idx
  ON public.folders USING btree (os_id) TABLESPACE pg_default;


-- Files belong to a folder
CREATE TABLE public.files (
  id        uuid NOT NULL DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name      text NOT NULL,
  content   text NOT NULL,
  type      text NOT NULL DEFAULT 'text'::text,

  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_folder_id_fkey FOREIGN KEY (folder_id)
    REFERENCES folders (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS files_folder_id_idx
  ON public.files USING btree (folder_id) TABLESPACE pg_default;


-- Messages belong to an OS (Nokia device)
CREATE TABLE public.messages (
  id      uuid NOT NULL DEFAULT gen_random_uuid(),
  os_id   uuid NOT NULL DEFAULT gen_random_uuid(),
  sender  text NOT NULL,
  content text NOT NULL,
  time    text NOT NULL,

  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_os_id_fkey FOREIGN KEY (os_id)
    REFERENCES life_os (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS messages_os_id_idx
  ON public.messages USING btree (os_id) TABLESPACE pg_default;


-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- RLS is ENABLED on all tables.
-- All policies use the same ownership pattern:
--   owner (user_id = auth.uid()) OR temporary OS (is_temporary = true)
--
-- Note: The API routes use supabaseServer (service role key) which
-- bypasses RLS. These policies serve as defense-in-depth for any
-- direct client access via the anon key.
-- ============================================================


-- ---- life_os policies ----

-- Anyone can create an OS
CREATE POLICY "Allow insert OS"
  ON public.life_os FOR INSERT
  TO public
  WITH CHECK (true);

-- Owner or temporary OS can be read
CREATE POLICY "Allow read own or temporary OS"
  ON public.life_os FOR SELECT
  TO public
  USING ((user_id = auth.uid()) OR (is_temporary = true));

-- Owner or temporary OS can be updated
CREATE POLICY "Allow update own or temporary OS"
  ON public.life_os FOR UPDATE
  TO public
  USING ((user_id = auth.uid()) OR (is_temporary = true));


-- ---- folders policies ----

-- Read folders if user owns the OS or OS is temporary
CREATE POLICY "Allow access folders via OS"
  ON public.folders FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM life_os
      WHERE life_os.id = folders.os_id
        AND (life_os.user_id = auth.uid() OR life_os.is_temporary = true)
    )
  );

-- Insert folders if user owns the OS or OS is temporary
CREATE POLICY "Allow insert folders"
  ON public.folders FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM life_os
      WHERE life_os.id = folders.os_id
        AND (life_os.user_id = auth.uid() OR life_os.is_temporary = true)
    )
  );


-- ---- files policies ----

-- Read files via folder → OS ownership chain
CREATE POLICY "Allow access files via folders"
  ON public.files FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM folders
      JOIN life_os ON life_os.id = folders.os_id
      WHERE folders.id = files.folder_id
        AND (life_os.user_id = auth.uid() OR life_os.is_temporary = true)
    )
  );

-- All operations on files via folder → OS ownership chain
CREATE POLICY "Allow modify files"
  ON public.files FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM folders
      JOIN life_os ON life_os.id = folders.os_id
      WHERE folders.id = files.folder_id
        AND (life_os.user_id = auth.uid() OR life_os.is_temporary = true)
    )
  );


-- ---- messages policies ----

-- Read messages if user owns the OS or OS is temporary
CREATE POLICY "Allow access messages via OS"
  ON public.messages FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM life_os
      WHERE life_os.id = messages.os_id
        AND (life_os.user_id = auth.uid() OR life_os.is_temporary = true)
    )
  );

-- Insert messages if user owns the OS or OS is temporary
CREATE POLICY "Allow insert messages"
  ON public.messages FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM life_os
      WHERE life_os.id = messages.os_id
        AND (life_os.user_id = auth.uid() OR life_os.is_temporary = true)
    )
  );


-- ============================================================
-- RELATIONSHIPS SUMMARY
-- ============================================================
-- life_os  ←──  folders  (os_id → life_os.id, CASCADE DELETE)
-- folders  ←──  files    (folder_id → folders.id, CASCADE DELETE)
-- life_os  ←──  messages (os_id → life_os.id, CASCADE DELETE)
--
-- Deleting a life_os row cascades to all its folders, files, and messages.
-- Deleting a folder cascades to all its files.
-- ============================================================


-- ============================================================
-- CONSTRAINTS SUMMARY
-- ============================================================
-- life_os_user_device_unique: Each user can have at most 1 OS per
-- device_type (e.g. 1 XP + 1 Nokia). Temporary OS (user_id = NULL)
-- is exempt since NULL != NULL in unique constraints.
-- ============================================================
