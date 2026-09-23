-- Supabase PostgreSQL Schema for TaskForm
-- Hierarchical To-Do List & Printable Document Generator

-- Enable necessary extensions
create extension if not exists "pgcrypto";

-- Enum types (or check constraints)
-- We use check constraints for maximum portability with Supabase client typing

-- 1. Profiles Table (mirrors auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Workspaces Table
create table if not exists public.workspaces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Categories Table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  icon text default 'folder',
  color text default '#3b82f6',
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. Subcategories Table
create table if not exists public.subcategories (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  description text,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 5. Tasks Table (supports subtasks via parent_task_id)
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  subcategory_id uuid references public.subcategories(id) on delete cascade not null,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  notes text,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium' not null,
  status text check (status in ('not_started', 'in_progress', 'waiting', 'completed', 'cancelled')) default 'not_started' not null,
  due_date timestamptz,
  start_date timestamptz,
  estimated_minutes integer,
  actual_minutes integer,
  completed_at timestamptz,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 6. Tags Table
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  color text default '#6b7280' not null,
  created_at timestamptz default now() not null
);

-- 7. Task Tags Junction Table
create table if not exists public.task_tags (
  task_id uuid references public.tasks(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (task_id, tag_id)
);

-- 8. Templates Table (pre-made or user custom project structures)
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_system boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.template_categories (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.templates(id) on delete cascade not null,
  name text not null,
  description text,
  icon text default 'folder',
  color text default '#3b82f6',
  sort_order integer default 0 not null
);

create table if not exists public.template_subcategories (
  id uuid default gen_random_uuid() primary key,
  template_category_id uuid references public.template_categories(id) on delete cascade not null,
  name text not null,
  description text,
  sort_order integer default 0 not null
);

create table if not exists public.template_tasks (
  id uuid default gen_random_uuid() primary key,
  template_subcategory_id uuid references public.template_subcategories(id) on delete cascade not null,
  parent_task_id uuid references public.template_tasks(id) on delete cascade,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium' not null,
  sort_order integer default 0 not null
);

-- Indexes for optimal lookup performance
create index if not exists idx_workspaces_user_id on public.workspaces(user_id);
create index if not exists idx_categories_workspace_id on public.categories(workspace_id);
create index if not exists idx_categories_sort_order on public.categories(sort_order);
create index if not exists idx_subcategories_category_id on public.subcategories(category_id);
create index if not exists idx_subcategories_sort_order on public.subcategories(sort_order);
create index if not exists idx_tasks_subcategory_id on public.tasks(subcategory_id);
create index if not exists idx_tasks_parent_task_id on public.tasks(parent_task_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_priority on public.tasks(priority);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_tasks_sort_order on public.tasks(sort_order);
create index if not exists idx_tags_user_id on public.tags(user_id);
create index if not exists idx_task_tags_task_id on public.task_tags(task_id);
create index if not exists idx_task_tags_tag_id on public.task_tags(tag_id);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace trigger set_workspaces_updated_at before update on public.workspaces
  for each row execute function public.handle_updated_at();

create or replace trigger set_categories_updated_at before update on public.categories
  for each row execute function public.handle_updated_at();

create or replace trigger set_subcategories_updated_at before update on public.subcategories
  for each row execute function public.handle_updated_at();

create or replace trigger set_tasks_updated_at before update on public.tasks
  for each row execute function public.handle_updated_at();

create or replace trigger set_templates_updated_at before update on public.templates
  for each row execute function public.handle_updated_at();

-- Auto create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  -- Also generate a default workspace for the new user
  insert into public.workspaces (user_id, name, description)
  values (
    new.id,
    'Personal Workspace',
    'My primary tasks and projects'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.tasks enable row level security;
alter table public.tags enable row level security;
alter table public.task_tags enable row level security;
alter table public.templates enable row level security;
alter table public.template_categories enable row level security;
alter table public.template_subcategories enable row level security;
alter table public.template_tasks enable row level security;

-- Profiles: Users can view and update their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Workspaces: Users can CRUD their own workspaces
create policy "Users can access their own workspaces"
  on public.workspaces for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Categories: Users can access categories of their workspaces
create policy "Users can access their own categories"
  on public.categories for all
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  )
  with check (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- Subcategories: Users can access subcategories belonging to their categories
create policy "Users can access their own subcategories"
  on public.subcategories for all
  using (
    category_id in (
      select c.id from public.categories c
      join public.workspaces w on c.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  )
  with check (
    category_id in (
      select c.id from public.categories c
      join public.workspaces w on c.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- Tasks: Users can access tasks belonging to their subcategories
create policy "Users can access their own tasks"
  on public.tasks for all
  using (
    subcategory_id in (
      select sc.id from public.subcategories sc
      join public.categories c on sc.category_id = c.id
      join public.workspaces w on c.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  )
  with check (
    subcategory_id in (
      select sc.id from public.subcategories sc
      join public.categories c on sc.category_id = c.id
      join public.workspaces w on c.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- Tags: Users can access their own tags
create policy "Users can access their own tags"
  on public.tags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Task Tags: Users can manage task tags if they own the task
create policy "Users can access task_tags"
  on public.task_tags for all
  using (
    task_id in (
      select t.id from public.tasks t
      join public.subcategories sc on t.subcategory_id = sc.id
      join public.categories c on sc.category_id = c.id
      join public.workspaces w on c.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  )
  with check (
    task_id in (
      select t.id from public.tasks t
      join public.subcategories sc on t.subcategory_id = sc.id
      join public.categories c on sc.category_id = c.id
      join public.workspaces w on c.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- Templates: System templates are readable by anyone; Custom templates only by owner
create policy "Read templates"
  on public.templates for select
  using (is_system = true or auth.uid() = user_id);

create policy "Manage own templates"
  on public.templates for all
  using (auth.uid() = user_id and is_system = false)
  with check (auth.uid() = user_id and is_system = false);

create policy "Read template categories"
  on public.template_categories for select
  using (
    template_id in (
      select id from public.templates where is_system = true or user_id = auth.uid()
    )
  );

create policy "Manage own template categories"
  on public.template_categories for all
  using (
    template_id in (
      select id from public.templates where user_id = auth.uid() and is_system = false
    )
  )
  with check (
    template_id in (
      select id from public.templates where user_id = auth.uid() and is_system = false
    )
  );

create policy "Read template subcategories"
  on public.template_subcategories for select
  using (
    template_category_id in (
      select tc.id from public.template_categories tc
      join public.templates t on tc.template_id = t.id
      where t.is_system = true or t.user_id = auth.uid()
    )
  );

create policy "Manage own template subcategories"
  on public.template_subcategories for all
  using (
    template_category_id in (
      select tc.id from public.template_categories tc
      join public.templates t on tc.template_id = t.id
      where t.user_id = auth.uid() and t.is_system = false
    )
  )
  with check (
    template_category_id in (
      select tc.id from public.template_categories tc
      join public.templates t on tc.template_id = t.id
      where t.user_id = auth.uid() and t.is_system = false
    )
  );

create policy "Read template tasks"
  on public.template_tasks for select
  using (
    template_subcategory_id in (
      select tsc.id from public.template_subcategories tsc
      join public.template_categories tc on tsc.template_category_id = tc.id
      join public.templates t on tc.template_id = t.id
      where t.is_system = true or t.user_id = auth.uid()
    )
  );

create policy "Manage own template tasks"
  on public.template_tasks for all
  using (
    template_subcategory_id in (
      select tsc.id from public.template_subcategories tsc
      join public.template_categories tc on tsc.template_category_id = tc.id
      join public.templates t on tc.template_id = t.id
      where t.user_id = auth.uid() and t.is_system = false
    )
  )
  with check (
    template_subcategory_id in (
      select tsc.id from public.template_subcategories tsc
      join public.template_categories tc on tsc.template_category_id = tc.id
      join public.templates t on tc.template_id = t.id
      where t.user_id = auth.uid() and t.is_system = false
    )
  );
