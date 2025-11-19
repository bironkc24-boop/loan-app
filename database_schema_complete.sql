-- QuickLoan Complete Database Schema for PostgreSQL
-- This schema supports multi-role loan management system
-- Includes tables, default data, and helper functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ROLES AND USERS
-- =============================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('borrower', 'Default user role - can apply for loans and track applications'),
    ('admin', 'Administrator - manages riders, reviews loans, and oversees system'),
    ('rider', 'Field agent - handles loan processing and customer visits')
ON CONFLICT (name) DO NOTHING;

-- Users table (standalone, no auth dependency)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    accepted_terms_at TIMESTAMP WITH TIME ZONE,
    terms_version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- =============================================
-- BORROWER PROFILES
-- =============================================

CREATE TYPE employment_status_enum AS ENUM ('employed', 'self_employed', 'unemployed', 'retired', 'student');

CREATE TABLE IF NOT EXISTS borrower_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employment_status employment_status_enum,
    employer_name VARCHAR(255),
    monthly_income NUMERIC(12, 2),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    documents JSONB DEFAULT '[]'::jsonb,
    credit_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RIDERS
-- =============================================

CREATE TYPE rider_status_enum AS ENUM ('active', 'inactive', 'on_leave', 'suspended');

CREATE TABLE IF NOT EXISTS riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    status rider_status_enum DEFAULT 'active',
    zone VARCHAR(100),
    max_assignments INTEGER DEFAULT 10,
    current_assignments INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LOAN PRODUCTS AND APPLICATIONS
-- =============================================

CREATE TYPE loan_product_type AS ENUM ('personal', 'business', 'education', 'home', 'auto');
CREATE TYPE loan_status_enum AS ENUM ('pending', 'reviewing', 'approved', 'rejected', 'disbursed', 'active', 'closed', 'defaulted');

CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
    product_type loan_product_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    term_months INTEGER NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    status loan_status_enum DEFAULT 'pending',
    purpose TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    disbursed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    monthly_payment NUMERIC(12, 2),
    total_repayment NUMERIC(12, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan documents
CREATE TYPE document_type_enum AS ENUM ('id_proof', 'income_proof', 'address_proof', 'bank_statement', 'other');

CREATE TABLE IF NOT EXISTS loan_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    document_type document_type_enum NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id)
);

-- Loan status history for audit trail
CREATE TABLE IF NOT EXISTS loan_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    old_status loan_status_enum,
    new_status loan_status_enum NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RIDER ASSIGNMENTS
-- =============================================

CREATE TYPE assignment_status_enum AS ENUM ('assigned', 'in_progress', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS rider_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    status assignment_status_enum DEFAULT 'assigned',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(rider_id, loan_id)
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TYPE notification_type_enum AS ENUM ('loan_status', 'assignment', 'system', 'reminder');

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    related_loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDICES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_rider_id ON loans(rider_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_applied_at ON loans(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_loan_documents_loan_id ON loan_documents(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_status_history_loan_id ON loan_status_history(loan_id);
CREATE INDEX IF NOT EXISTS idx_rider_assignments_rider_id ON rider_assignments(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_assignments_loan_id ON rider_assignments(loan_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_borrower_profiles_updated_at ON borrower_profiles;
CREATE TRIGGER update_borrower_profiles_updated_at BEFORE UPDATE ON borrower_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_riders_updated_at ON riders;
CREATE TRIGGER update_riders_updated_at BEFORE UPDATE ON riders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create loan status history on loan status change
CREATE OR REPLACE FUNCTION create_loan_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO loan_status_history (loan_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NULL);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS loan_status_change_trigger ON loans;
CREATE TRIGGER loan_status_change_trigger
    AFTER UPDATE ON loans
    FOR EACH ROW
    EXECUTE FUNCTION create_loan_status_history();

-- Function to update rider assignment count
CREATE OR REPLACE FUNCTION update_rider_assignment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE riders SET current_assignments = current_assignments + 1
        WHERE id = NEW.rider_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE riders SET current_assignments = GREATEST(current_assignments - 1, 0)
        WHERE id = OLD.rider_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE riders SET 
            current_assignments = GREATEST(current_assignments - 1, 0),
            total_completed = total_completed + 1
        WHERE id = NEW.rider_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS rider_assignment_count_trigger ON rider_assignments;
CREATE TRIGGER rider_assignment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON rider_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_rider_assignment_count();

-- =============================================
-- DEFAULT USERS
-- =============================================
-- Password: mhel123 for borrower, almonte17 for admin

DO $$
DECLARE
    borrower_user_id UUID;
    admin_user_id UUID;
    borrower_role_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO borrower_role_id FROM roles WHERE name = 'borrower';
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    
    -- Create borrower user (password: mhel123)
    INSERT INTO users (email, password_hash, full_name, phone, accepted_terms_at, terms_version)
    VALUES ('mhel7881@gmail.com', crypt('mhel123', gen_salt('bf')), 'Borrower User', NULL, NOW(), '1.0')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO borrower_user_id;
    
    -- If user already exists, get their ID
    IF borrower_user_id IS NULL THEN
        SELECT id INTO borrower_user_id FROM users WHERE email = 'mhel7881@gmail.com';
    END IF;
    
    -- Assign borrower role
    IF borrower_user_id IS NOT NULL AND borrower_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (borrower_user_id, borrower_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        
        -- Create borrower profile
        INSERT INTO borrower_profiles (user_id, employment_status, monthly_income)
        VALUES (borrower_user_id, 'employed', 5000.00)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    -- Create admin user (password: almonte17)
    INSERT INTO users (email, password_hash, full_name, phone, accepted_terms_at, terms_version)
    VALUES ('kcbiron79@gmail.com', crypt('almonte17', gen_salt('bf')), 'Admin User', NULL, NOW(), '1.0')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO admin_user_id;
    
    -- If user already exists, get their ID
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM users WHERE email = 'kcbiron79@gmail.com';
    END IF;
    
    -- Assign admin role
    IF admin_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (admin_user_id, admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
END $$;
