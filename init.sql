-- Production Database Initialization Script
-- This script sets up the production database for Syntara Tenders AI

-- Create database (run this as superuser)
-- CREATE DATABASE tenders_ai;

-- Create user and grant permissions
-- CREATE USER tenders_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE tenders_ai TO tenders_user;

-- Connect to the database
\c tenders_ai;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tender_status AS ENUM ('discovery', 'interested', 'working', 'submitted', 'closed', 'not_interested');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_category AS ENUM ('tender_documents', 'supporting_documents', 'company_documents');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
-- These will be created by Prisma migrations, but we can add additional ones here

-- Create full-text search indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenders_title_search 
-- ON tenders USING gin(to_tsvector('english', title));

-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenders_description_search 
-- ON tenders USING gin(to_tsvector('english', description));

-- Create partial indexes for common queries
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenders_active 
-- ON tenders (created_at) WHERE status IN ('discovery', 'interested', 'working');

-- Create composite indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenders_status_priority 
-- ON tenders (status, priority);

-- Performance monitoring queries
-- These can be used to monitor database performance

-- Query to check table sizes
-- SELECT 
--     schemaname,
--     tablename,
--     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Query to check index usage
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_tup_read,
--     idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- ORDER BY idx_tup_read DESC;

-- Query to check slow queries
-- SELECT 
--     query,
--     calls,
--     total_time,
--     mean_time,
--     rows
-- FROM pg_stat_statements 
-- ORDER BY total_time DESC 
-- LIMIT 10;

-- Backup and maintenance procedures
-- These should be run regularly in production

-- Vacuum and analyze tables (run during maintenance windows)
-- VACUUM ANALYZE;

-- Update table statistics
-- ANALYZE;

-- Check for unused indexes
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_tup_read,
--     idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE idx_tup_read = 0 
-- AND idx_tup_fetch = 0;

-- Connection limits and monitoring
-- ALTER SYSTEM SET max_connections = 100;
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';
-- ALTER SYSTEM SET checkpoint_completion_target = 0.9;
-- ALTER SYSTEM SET wal_buffers = '16MB';
-- ALTER SYSTEM SET default_statistics_target = 100;

-- Security settings
-- ALTER SYSTEM SET ssl = on;
-- ALTER SYSTEM SET log_statement = 'mod';
-- ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Create backup user (read-only access for backups)
-- CREATE USER backup_user WITH PASSWORD 'backup_password';
-- GRANT CONNECT ON DATABASE tenders_ai TO backup_user;
-- GRANT USAGE ON SCHEMA public TO backup_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO backup_user;

-- Create monitoring user
-- CREATE USER monitoring_user WITH PASSWORD 'monitoring_password';
-- GRANT CONNECT ON DATABASE tenders_ai TO monitoring_user;
-- GRANT USAGE ON SCHEMA public TO monitoring_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO monitoring_user;

-- Log completion
INSERT INTO pg_stat_statements_reset();
