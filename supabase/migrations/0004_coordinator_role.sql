-- New role: Coordenação (coordinator), between admin and leader in responsibility.
-- Must live alone in its own migration file: Postgres does not allow a new
-- enum value to be used in the same transaction that created it, and
-- scripts/run-migration.js sends the whole file as a single implicit
-- transaction.
alter type public.user_role add value 'coordinator';
