create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),

  employer_registration_id bigint not null,
  type text check (type in ('time_in', 'time_out')) not null,
  status text check (status in ('on_time', 'late')),

  timestamp timestamp with time zone default now(),

  constraint fk_employer_registration
    foreign key (employer_registration_id)
    references public.employer_registration(id)
    on delete cascade
);

create index if not exists idx_attendance_employee_id
on public.attendance_logs(employer_registration_id);

create index if not exists idx_attendance_timestamp
on public.attendance_logs(timestamp desc);