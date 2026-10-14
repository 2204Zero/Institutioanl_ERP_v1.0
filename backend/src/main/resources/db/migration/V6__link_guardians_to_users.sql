-- Migration V6: Link Users to Guardian Domain Entities

-- 1. Add nullable user_id to guardians table
ALTER TABLE guardians ADD COLUMN user_id BIGINT;
ALTER TABLE guardians ADD CONSTRAINT fk_guardians_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 2. Deterministic backfill: link accounts where role is PARENT and email matches unambiguously
UPDATE guardians 
SET user_id = (
    SELECT u.id 
    FROM users u 
    WHERE lower(u.email) = lower(guardians.email) 
      AND u.role = 'PARENT'
)
WHERE EXISTS (
    SELECT 1 
    FROM users u 
    WHERE lower(u.email) = lower(guardians.email) 
      AND u.role = 'PARENT'
);
