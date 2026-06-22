-- Criar bucket privado para uploads de briefing
-- Execute este SQL no Supabase SQL Editor após criar o bucket via dashboard
-- OU use o snippet abaixo via API/função

-- Criar bucket (via SQL function do storage)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'briefing-uploads',
  'briefing-uploads',
  false,
  52428800, -- 50MB
  array['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml',
        'application/pdf','application/postscript',
        'application/zip','application/x-zip-compressed']
)
on conflict (id) do nothing;

-- Policy: service role tem acesso total (usado server-side)
create policy "service_role_all" on storage.objects
  for all to service_role using (bucket_id = 'briefing-uploads');

-- Policy: autenticado (admin) pode ver e baixar
create policy "admin_read_uploads" on storage.objects
  for select to authenticated using (bucket_id = 'briefing-uploads');

-- Nenhum acesso anon direto — uploads e downloads usam signed URLs geradas server-side
