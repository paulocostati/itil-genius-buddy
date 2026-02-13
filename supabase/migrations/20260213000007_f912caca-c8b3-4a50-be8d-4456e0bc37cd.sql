
-- Create admin-uploads bucket for temporary PDF storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-uploads', 'admin-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Only admins can upload to admin-uploads
CREATE POLICY "Admins can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-uploads'
  AND public.has_role(auth.uid(), 'admin')
);

-- RLS: Only admins can read from admin-uploads
CREATE POLICY "Admins can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'admin-uploads'
  AND public.has_role(auth.uid(), 'admin')
);

-- RLS: Only admins can delete from admin-uploads
CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-uploads'
  AND public.has_role(auth.uid(), 'admin')
);
