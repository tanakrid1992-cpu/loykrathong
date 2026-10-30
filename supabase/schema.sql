-- ระบบลอยกระทงออนไลน์ เทศบาลตำบลคลองตำหรุ
-- วิธีใช้: Supabase > SQL Editor > New query > วางทั้งไฟล์ > Run

-- 1) ตารางกระทง
create table if not exists public.krathongs (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type       smallint not null check (type between 0 and 7),
  name       text check (char_length(name) <= 24),
  wish       text not null check (char_length(wish) between 1 and 120),
  consent    boolean not null default false,
  eco        boolean not null default false,
  flagged    boolean not null default false,
  hidden     boolean not null default false
);
create index if not exists krathongs_created_idx on public.krathongs (created_at);

-- 2) รายชื่อเจ้าหน้าที่ (อีเมลที่ใช้ล็อกอินหน้า admin.html)
create table if not exists public.staff (email text primary key);
alter table public.staff enable row level security;   -- ไม่มี policy = เข้าถึงจากเว็บไม่ได้

-- 3) คำไม่สุภาพ (เพิ่ม/ลบได้ใน Table Editor)
create table if not exists public.bad_words (word text primary key);
alter table public.bad_words enable row level security;
insert into public.bad_words(word) values
 ('ควย'),('เหี้ย'),('เฮี้ย'),('สัส'),('สัด'),('เย็ด'),('หน้าหี'),('หีแตก'),('อีดอก'),('ดอกทอง'),
 ('ไอ้สัตว์'),('อีสัตว์'),('ชิบหาย'),('ฉิบหาย'),('ระยำ'),('จัญไร'),('ส้นตีน'),('มึง'),('สันดาน'),('ไอ้ควาย'),
 ('fuck'),('shit'),('bitch'),('asshole'),('cunt'),('bastard')
on conflict do nothing;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- 4) ตรวจข้อความก่อนบันทึก: คำไม่สุภาพ -> ซ่อนรอเจ้าหน้าที่ตรวจ, กันสแปม
create or replace function public.moderate_krathong() returns trigger
language plpgsql security definer set search_path = public as $$
declare txt text := lower(coalesce(new.name,'') || ' ' || new.wish);
begin
  if (select count(*) from krathongs where created_at > now() - interval '10 seconds') > 150 then
    raise exception 'ระบบมีผู้ใช้หนาแน่น กรุณาลองใหม่';
  end if;
  new.created_at := now();
  new.eco := new.type in (0,2,3,7);            -- ECO_TYPES: ใบตอง ขนมปัง กาบมะพร้าว หยวกกล้วย
  new.name := nullif(trim(new.name), '');
  if new.name is null then new.consent := false; end if;
  new.flagged := exists (select 1 from bad_words where position(lower(word) in txt) > 0);
  new.hidden := new.flagged;
  return new;
end $$;
drop trigger if exists trg_moderate on public.krathongs;
create trigger trg_moderate before insert on public.krathongs
  for each row execute function public.moderate_krathong();

-- 5) สิทธิ์การเข้าถึง (Row Level Security)
alter table public.krathongs enable row level security;
drop policy if exists "public read" on public.krathongs;
drop policy if exists "public insert" on public.krathongs;
drop policy if exists "staff read" on public.krathongs;
drop policy if exists "staff update" on public.krathongs;
drop policy if exists "staff delete" on public.krathongs;
create policy "public read"   on public.krathongs for select using (hidden = false);
create policy "public insert" on public.krathongs for insert with check (true);
create policy "staff read"    on public.krathongs for select to authenticated using (public.is_staff());
create policy "staff update"  on public.krathongs for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff delete"  on public.krathongs for delete to authenticated using (public.is_staff());
-- ประชาชนเพิ่มได้เฉพาะคอลัมน์เหล่านี้
revoke insert on public.krathongs from anon, authenticated;
grant insert (type, name, wish, consent) on public.krathongs to anon, authenticated;
grant select on public.krathongs to anon, authenticated;
grant update (hidden, flagged, name, wish), delete on public.krathongs to authenticated;

-- 6) ยอดรวมสาธารณะ
create or replace function public.public_stats() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('total', count(*), 'eco', count(*) filter (where eco)) from krathongs;
$$;
grant execute on function public.public_stats() to anon, authenticated;

-- 7) สถิติสำหรับผู้บริหาร (เฉพาะเจ้าหน้าที่)
create or replace function public.admin_stats() returns json
language sql stable security definer set search_path = public as $$
  select case when not is_staff() then null else json_build_object(
    'total',   (select count(*) from krathongs),
    'today',   (select count(*) from krathongs where (created_at at time zone 'Asia/Bangkok')::date = (now() at time zone 'Asia/Bangkok')::date),
    'eco',     (select count(*) from krathongs where eco),
    'named',   (select count(*) from krathongs where name is not null),
    'hidden',  (select count(*) from krathongs where hidden),
    'flagged', (select count(*) from krathongs where flagged and hidden),
    'by_type', (select coalesce(json_object_agg(type, c), '{}') from (select type, count(*) c from krathongs group by type) t),
    'by_hour', (select coalesce(json_object_agg(h, c), '{}') from (select extract(hour from created_at at time zone 'Asia/Bangkok')::int h, count(*) c from krathongs group by 1) t),
    'by_day',  (select coalesce(json_agg(json_build_object('d', d, 'c', c) order by d), '[]') from (select (created_at at time zone 'Asia/Bangkok')::date d, count(*) c from krathongs group by 1) t)
  ) end;
$$;
grant execute on function public.admin_stats() to authenticated;

-- 8) เพิ่มอีเมลเจ้าหน้าที่ (แก้เป็นอีเมลจริง แล้วสร้างผู้ใช้เดียวกันใน Authentication > Users)
-- insert into public.staff(email) values ('staff@example.com');
