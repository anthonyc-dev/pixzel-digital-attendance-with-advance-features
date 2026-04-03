-- Add descriptor column
alter table public.employer_registration
add column if not exists descriptor float8[];
