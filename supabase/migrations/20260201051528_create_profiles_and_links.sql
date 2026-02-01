-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  slug TEXT UNIQUE NOT NULL,
  views INTEGER DEFAULT 0
);

-- Create links table
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL
);

-- Create index on profile_id for faster queries
CREATE INDEX idx_links_profile_id ON links(profile_id);

-- Create index on slug for faster lookups
CREATE INDEX idx_profiles_slug ON profiles(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on profiles"
  ON profiles FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on profiles"
  ON profiles FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on links"
  ON links FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on links"
  ON links FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on links"
  ON links FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on links"
  ON links FOR DELETE
  USING (true);
