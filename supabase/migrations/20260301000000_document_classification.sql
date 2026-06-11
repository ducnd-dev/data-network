-- Document classification + credit-based usage
alter table public.documents
  add column if not exists document_type text
    check (document_type in ('invoice','receipt','purchase_order','bank_statement','general','unknown')),
  add column if not exists classification_confidence numeric,
  add column if not exists classification_source text
    check (classification_source is null or classification_source in ('heuristic','llm','azure'));

alter table public.ocr_jobs
  add column if not exists pipeline_id text,
  add column if not exists credit_multiplier numeric not null default 1,
  add column if not exists credits_charged int not null default 1,
  add column if not exists estimated_cogs_aud numeric,
  add column if not exists llm_tokens_in int,
  add column if not exists llm_tokens_out int;

alter table public.documents drop constraint if exists documents_status_check;
alter table public.documents add constraint documents_status_check
  check (status in ('uploaded', 'classifying', 'processing', 'completed', 'failed'));

alter table public.usage_events drop constraint if exists usage_events_event_type_check;
alter table public.usage_events add constraint usage_events_event_type_check
  check (event_type in ('ocr_page', 'classification', 'llm_enhance'));
