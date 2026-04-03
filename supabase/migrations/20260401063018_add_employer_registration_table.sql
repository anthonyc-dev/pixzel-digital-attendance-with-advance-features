create table if not exists public.employer_registration (
  id bigserial primary key,
  employer_id text not null,
  employer_name text not null,
  employer_position text not null,
  face_detected boolean not null default false,
  status text not null,
  image text,
  created_at timestamp default now()
);