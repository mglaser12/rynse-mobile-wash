
-- Create vehicle-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'Vehicle Images', true);

-- Allow authenticated users to upload and view vehicle images
CREATE POLICY "Allow authenticated users to upload vehicle images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "Allow public users to view vehicle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

CREATE POLICY "Allow authenticated users to update their own vehicle images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vehicle-images' AND auth.uid() = owner);

CREATE POLICY "Allow authenticated users to delete their own vehicle images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vehicle-images' AND auth.uid() = owner);
