-- Add rich profile fields for enhanced public profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Add comments
COMMENT ON COLUMN profiles.gallery IS 'Array of image URLs for profile gallery';
COMMENT ON COLUMN profiles.testimonials IS 'Array of testimonials with {author, text, date, rating}';
COMMENT ON COLUMN profiles.faq IS 'Array of FAQ items with {question, answer}';
COMMENT ON COLUMN profiles.social_links IS 'Social media links {instagram, facebook, whatsapp, linkedin, etc}';
