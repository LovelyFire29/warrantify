-- The storage.objects policies in 20260823095104 are scoped to the 'device-documents' bucket, but no
-- migration ever created the bucket itself, so every upload failed with
-- {"statusCode":"404","error":"Bucket not found","code":"NoSuchBucket"}.
--
-- Private on purpose: the app opens files through short-lived signed URLs (getDocumentUrl in
-- use-device-detail.ts), and the SELECT policy limits each user to their own <user_id>/ folder.
-- The limits mirror the register form ("PDF, PNG or JPG up to 10 MB each") and its file picker
-- (accept="image/*,application/pdf").
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('device-documents', 'device-documents', false, 10485760, array['application/pdf', 'image/*'])
on conflict (id) do nothing;
