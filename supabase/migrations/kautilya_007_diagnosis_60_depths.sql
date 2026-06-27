-- KAUTILYA 007: version diagnosis depths without rewriting historical reports.

alter table public.aspirant_profiles
  drop constraint if exists aspirant_profiles_diagnosis_depth_check;

alter table public.aspirant_profiles
  add constraint aspirant_profiles_diagnosis_depth_check
  check (diagnosis_depth in ('none', 'free30', 'paid50', 'free40', 'paid60'));

alter table public.diagnosis_reports
  drop constraint if exists diagnosis_reports_report_depth_check;

alter table public.diagnosis_reports
  add constraint diagnosis_reports_report_depth_check
  check (report_depth in ('free30', 'paid50', 'free40', 'paid60', 'mock_result'));
