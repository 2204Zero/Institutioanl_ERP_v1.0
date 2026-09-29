# PostgreSQL Library Relational Database Schema DDL

## 1. DDL Entity Definitions

```sql
-- 1. Books Table
CREATE TABLE books (
    id VARCHAR(36) PRIMARY KEY,
    book_id VARCHAR(30) NOT NULL UNIQUE,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    barcode VARCHAR(50) NOT NULL UNIQUE,
    qr_code_payload TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    edition VARCHAR(20),
    language VARCHAR(30) DEFAULT 'English',
    author VARCHAR(150) NOT NULL,
    co_author VARCHAR(150),
    publisher VARCHAR(150) NOT NULL,
    publication_year INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    keywords TEXT[],
    shelf VARCHAR(30) NOT NULL,
    rack VARCHAR(30) NOT NULL,
    floor VARCHAR(30) NOT NULL,
    campus VARCHAR(50) DEFAULT 'Main Campus',
    library_branch VARCHAR(100) DEFAULT 'Central Library',
    pages INT,
    price NUMERIC(10,2) NOT NULL,
    supplier VARCHAR(150),
    purchase_date DATE,
    status VARCHAR(20) CHECK (status IN ('AVAILABLE', 'ISSUED', 'RESERVED', 'LOST', 'ARCHIVED')),
    condition VARCHAR(20) CHECK (condition IN ('NEW', 'GOOD', 'FAIR', 'DAMAGED', 'REPAIR_NEEDED')),
    copies_total INT NOT NULL DEFAULT 1,
    copies_available INT NOT NULL DEFAULT 1,
    is_digital BOOLEAN DEFAULT FALSE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Issue Transactions Table
CREATE TABLE issue_transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_code VARCHAR(30) NOT NULL UNIQUE,
    book_id VARCHAR(36) NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    member_id VARCHAR(36) NOT NULL,
    member_roll_no VARCHAR(30) NOT NULL,
    member_name VARCHAR(100) NOT NULL,
    member_role VARCHAR(20) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    renew_count INT DEFAULT 0,
    fine_amount NUMERIC(8,2) DEFAULT 0.00,
    status VARCHAR(20) CHECK (status IN ('ISSUED', 'RETURNED', 'OVERDUE', 'LOST')),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT
);
```

---

## 2. High-Performance Indexing
- `CREATE INDEX idx_books_isbn ON books(isbn);`
- `CREATE INDEX idx_books_title ON books(title);`
- `CREATE INDEX idx_issue_member ON issue_transactions(member_roll_no);`
