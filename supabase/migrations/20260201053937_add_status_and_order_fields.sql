-- Create status enum type
CREATE TYPE profile_status AS ENUM ('active', 'inactive');
CREATE TYPE link_status AS ENUM ('active', 'inactive');

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN status profile_status DEFAULT 'active' NOT NULL,
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Add new columns to links table
ALTER TABLE links
ADD COLUMN "order" INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN is_hot BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN views INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN status link_status DEFAULT 'active' NOT NULL,
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Create function to auto-set order for new links
CREATE OR REPLACE FUNCTION set_link_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."order" = 0 THEN
    SELECT COALESCE(MAX("order"), 0) + 1 INTO NEW."order"
    FROM links
    WHERE profile_id = NEW.profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-setting link order
CREATE TRIGGER trigger_set_link_order
BEFORE INSERT ON links
FOR EACH ROW
EXECUTE FUNCTION set_link_order();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating updated_at on profiles
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for updating updated_at on links
CREATE TRIGGER trigger_links_updated_at
BEFORE UPDATE ON links
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Set initial order for existing links based on their id/creation
WITH ordered_links AS (
  SELECT id, profile_id, ROW_NUMBER() OVER (PARTITION BY profile_id ORDER BY id) as rn
  FROM links
)
UPDATE links
SET "order" = ordered_links.rn
FROM ordered_links
WHERE links.id = ordered_links.id;
