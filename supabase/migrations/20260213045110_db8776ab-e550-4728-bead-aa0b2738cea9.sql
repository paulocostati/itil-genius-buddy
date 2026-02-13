INSERT INTO storage.buckets (id, name, public) VALUES ('product-covers', 'product-covers', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view product covers" ON storage.objects FOR SELECT USING (bucket_id = 'product-covers');

CREATE POLICY "Admins can upload product covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product covers" ON storage.objects FOR UPDATE USING (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product covers" ON storage.objects FOR DELETE USING (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));