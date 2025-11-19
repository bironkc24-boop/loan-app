    -- QuickLoan Database Schema for Supabase
    -- This schema supports multi-role loan management system

    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- =============================================
    -- ROLES AND USERS
    -- =============================================

    -- Roles table
    CREATE TABLE roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Insert default roles
    INSERT INTO roles (name, description) VALUES
        ('borrower', 'Default user role - can apply for loans and track applications'),
        ('admin', 'Administrator - manages riders, reviews loans, and oversees system'),
        ('rider', 'Field agent - handles loan processing and customer visits');

    -- Users profile table (extends Supabase auth.users)
    CREATE TABLE users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        avatar_url TEXT,
        accepted_terms_at TIMESTAMP WITH TIME ZONE,
        terms_version VARCHAR(20) DEFAULT '1.0',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- User roles junction table
    CREATE TABLE user_roles (
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

    CREATE TABLE borrower_profiles (
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

    CREATE TABLE riders (
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

    CREATE TABLE loans (
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

    CREATE TABLE loan_documents (
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
    CREATE TABLE loan_status_history (
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

    CREATE TABLE rider_assignments (
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

    CREATE TABLE notifications (
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

    CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
    CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
    CREATE INDEX idx_loans_borrower_id ON loans(borrower_id);
    CREATE INDEX idx_loans_rider_id ON loans(rider_id);
    CREATE INDEX idx_loans_status ON loans(status);
    CREATE INDEX idx_loans_applied_at ON loans(applied_at DESC);
    CREATE INDEX idx_loan_documents_loan_id ON loan_documents(loan_id);
    CREATE INDEX idx_loan_status_history_loan_id ON loan_status_history(loan_id);
    CREATE INDEX idx_rider_assignments_rider_id ON rider_assignments(rider_id);
    CREATE INDEX idx_rider_assignments_loan_id ON rider_assignments(loan_id);
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX idx_notifications_read ON notifications(read);

    -- =============================================
    -- ROW LEVEL SECURITY (RLS) POLICIES
    -- =============================================

    -- Enable RLS on all tables
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE borrower_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
    ALTER TABLE loan_documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE loan_status_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE rider_assignments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

    -- ============================================= 
    -- COMPREHENSIVE RLS POLICIES
    -- =============================================

    -- Helper function to check if user has a specific role
    CREATE OR REPLACE FUNCTION has_role(role_name text)
    RETURNS boolean AS $$
    BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = role_name
    );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Roles table policies (read-only for all authenticated users)
    CREATE POLICY "Everyone can view roles"
        ON roles FOR SELECT
        TO authenticated
        USING (true);

    -- Users table policies
    CREATE POLICY "Users can view their own profile"
        ON users FOR SELECT
        TO authenticated
        USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile"
        ON users FOR UPDATE
        TO authenticated
        USING (auth.uid() = id);

    CREATE POLICY "Admins can view all users"
        ON users FOR SELECT
        TO authenticated
        USING (has_role('admin'));

    -- Service role can insert users (for registration)
    CREATE POLICY "Service role can insert users"
        ON users FOR INSERT
        TO service_role
        WITH CHECK (true);

    CREATE POLICY "Users can insert their own profile"
        ON users FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);

    -- User roles policies
    CREATE POLICY "Users can view their own roles"
        ON user_roles FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

    CREATE POLICY "Admins can view all roles"
        ON user_roles FOR SELECT
        TO authenticated
        USING (has_role('admin'));

    -- Service role manages role assignments
    CREATE POLICY "Service role can manage user roles"
        ON user_roles FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);

    -- Borrower profiles policies
    CREATE POLICY "Borrowers can view their own profile"
        ON borrower_profiles FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

    CREATE POLICY "Borrowers can update their own profile"
        ON borrower_profiles FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id);

    CREATE POLICY "Admins can view all borrower profiles"
        ON borrower_profiles FOR SELECT
        TO authenticated
        USING (has_role('admin'));

    CREATE POLICY "Service role can insert borrower profiles"
        ON borrower_profiles FOR INSERT
        TO service_role
        WITH CHECK (true);

    CREATE POLICY "Borrowers can insert their own profile"
        ON borrower_profiles FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

    -- Riders policies
    CREATE POLICY "Riders can view their own profile"
        ON riders FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

    CREATE POLICY "Admins can view all riders"
        ON riders FOR SELECT
        TO authenticated
        USING (has_role('admin'));

    CREATE POLICY "Admins can manage riders"
        ON riders FOR ALL
        TO authenticated
        USING (has_role('admin'))
        WITH CHECK (has_role('admin'));

    -- Loans policies
    CREATE POLICY "Borrowers can view their own loans"
        ON loans FOR SELECT
        TO authenticated
        USING (auth.uid() = borrower_id);

    CREATE POLICY "Borrowers can create loans"
        ON loans FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = borrower_id);

    CREATE POLICY "Admins can view all loans"
        ON loans FOR SELECT
        TO authenticated
        USING (has_role('admin'));

    CREATE POLICY "Admins can update loans"
        ON loans FOR UPDATE
        TO authenticated
        USING (has_role('admin'));

    CREATE POLICY "Riders can view their assigned loans"
        ON loans FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM riders
                WHERE riders.user_id = auth.uid()
                AND riders.id = loans.rider_id
            )
        );

    -- Service role can manage loans
    CREATE POLICY "Service role can manage loans"
        ON loans FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);

    -- Loan documents policies
    CREATE POLICY "Borrowers can view their loan documents"
        ON loan_documents FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM loans
                WHERE loans.id = loan_documents.loan_id
                AND loans.borrower_id = auth.uid()
            )
        );

    CREATE POLICY "Borrowers can upload their loan documents"
        ON loan_documents FOR INSERT
        TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM loans
                WHERE loans.id = loan_documents.loan_id
                AND loans.borrower_id = auth.uid()
            )
        );

    CREATE POLICY "Admins can view all loan documents"
        ON loan_documents FOR SELECT
        TO authenticated
        USING (has_role('admin'));

    CREATE POLICY "Riders can view assigned loan documents"
        ON loan_documents FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM loans l
                JOIN riders r ON r.id = l.rider_id
                WHERE l.id = loan_documents.loan_id
                AND r.user_id = auth.uid()
            )
        );

    -- Loan status history policies
    CREATE POLICY "Users can view their loan history"
        ON loan_status_history FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM loans
                WHERE loans.id = loan_status_history.loan_id
                AND (loans.borrower_id = auth.uid() OR has_role('admin'))
            )
        );

    CREATE POLICY "Service role can insert status history"
        ON loan_status_history FOR INSERT
        TO service_role
        WITH CHECK (true);

    -- Rider assignments policies
    CREATE POLICY "Riders can view their assignments"
        ON rider_assignments FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM riders
                WHERE riders.id = rider_assignments.rider_id
                AND riders.user_id = auth.uid()
            )
        );

    CREATE POLICY "Riders can update their assignments"
        ON rider_assignments FOR UPDATE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM riders
                WHERE riders.id = rider_assignments.rider_id
                AND riders.user_id = auth.uid()
            )
        );

    CREATE POLICY "Admins can manage all assignments"
        ON rider_assignments FOR ALL
        TO authenticated
        USING (has_role('admin'))
        WITH CHECK (has_role('admin'));

    CREATE POLICY "Service role can manage assignments"
        ON rider_assignments FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);

    -- Notifications policies
    CREATE POLICY "Users can view their own notifications"
        ON notifications FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own notifications"
        ON notifications FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id);

    CREATE POLICY "Service role can create notifications"
        ON notifications FOR INSERT
        TO service_role
        WITH CHECK (true);

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
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_borrower_profiles_updated_at BEFORE UPDATE ON borrower_profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_riders_updated_at BEFORE UPDATE ON riders
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Function to create loan status history on loan status change
    CREATE OR REPLACE FUNCTION create_loan_status_history()
    RETURNS TRIGGER AS $$
    BEGIN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO loan_status_history (loan_id, old_status, new_status, changed_by)
            VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
        END IF;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

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

    CREATE TRIGGER rider_assignment_count_trigger
        AFTER INSERT OR UPDATE OR DELETE ON rider_assignments
        FOR EACH ROW
        EXECUTE FUNCTION update_rider_assignment_count();

