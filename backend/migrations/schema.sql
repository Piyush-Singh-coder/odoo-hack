CREATE DATABASE IF NOT EXISTS expense_management;
USE expense_management;

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
  manager_id INT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_company_role (company_id, role),
  INDEX idx_manager (manager_id)
);

-- Approval Rules Table
CREATE TABLE IF NOT EXISTS approval_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  is_manager_approver BOOLEAN DEFAULT true,
  rule_type ENUM('sequential', 'percentage', 'specific_approver', 'hybrid') DEFAULT 'sequential',
  percentage_threshold DECIMAL(5,2) NULL,
  specific_approver_id INT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (specific_approver_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_company_active (company_id, is_active)
);

-- Approval Steps Table (for sequential approval)
CREATE TABLE IF NOT EXISTS approval_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  approval_rule_id INT NOT NULL,
  step_order INT NOT NULL,
  approver_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (approval_rule_id) REFERENCES approval_rules(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rule_order (approval_rule_id, step_order),
  INDEX idx_rule_order (approval_rule_id, step_order)
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  approval_rule_id INT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  converted_amount DECIMAL(15,2) NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  receipt_path VARCHAR(500) NULL,
  status ENUM('pending', 'approved', 'rejected', 'partially_approved') DEFAULT 'pending',
  current_step INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approval_rule_id) REFERENCES approval_rules(id) ON DELETE SET NULL,
  INDEX idx_employee_status (employee_id, status),
  INDEX idx_company_status (company_id, status),
  INDEX idx_date (expense_date)
);

-- Expense Approvals Table
CREATE TABLE IF NOT EXISTS expense_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expense_id INT NOT NULL,
  approver_id INT NOT NULL,
  step_order INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_expense_status (expense_id, status),
  INDEX idx_approver_status (approver_id, status)
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expense_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_expense (expense_id),
  INDEX idx_user (user_id)
);