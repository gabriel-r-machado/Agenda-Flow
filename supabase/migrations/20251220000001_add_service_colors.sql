-- Add color column to services table for visual categorization
ALTER TABLE services
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#10B981' CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

-- Add comment
COMMENT ON COLUMN services.color IS 'Hex color code for service badge visualization (e.g., #10B981)';
