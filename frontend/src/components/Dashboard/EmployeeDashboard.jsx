// components/Dashboard/EmployeeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore, useAuthStore } from '../../stores';
import './Dashboard.css';
const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { myExpenses, fetchMyExpenses } = useExpenseStore();
  
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchMyExpenses();
  }, []);

  useEffect(() => {
    if (myExpenses.length > 0) {
      const pending = myExpenses.filter(e => e.status === 'pending').length;
      const approved = myExpenses.filter(e => e.status === 'approved').length;
      const rejected = myExpenses.filter(e => e.status === 'rejected').length;
      const total = myExpenses
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

      setStats({
        pending,
        approved,
        rejected,
        totalAmount: total.toFixed(2),
      });
    }
  }, [myExpenses]);

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header-section">
        <h2>Welcome back, {user.firstName}! 👋</h2>
        <p className="subtitle">Manage your expense claims</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon="⏳"
          color="#f59e0b"
          onClick={() => navigate('/expenses/my?status=pending')}
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon="✅"
          color="#10b981"
          onClick={() => navigate('/expenses/my?status=approved')}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon="❌"
          color="#ef4444"
          onClick={() => navigate('/expenses/my?status=rejected')}
        />
        <StatCard
          title="Total Approved"
          value={`$${stats.totalAmount}`}
          icon="💵"
          color="#06b6d4"
        />
      </div>

      {/* Main Action Card */}
      <div className="main-action-card">
        <div className="action-content">
          <div className="action-icon-large">📸</div>
          <h3>Submit New Expense</h3>
          <p>Snap a photo of your receipt and let OCR do the work!</p>
          <button 
            className="btn-primary-large"
            onClick={() => navigate('/expenses/create')}
          >
            Create Expense Claim
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="action-cards-grid">
          <ActionCard
            title="Submit Expense"
            description="Create a new expense claim"
            icon="➕"
            onClick={() => navigate('/expenses/create')}
          />
          <ActionCard
            title="My Expenses"
            description="View all your expense claims"
            icon="📋"
            onClick={() => navigate('/expenses/my')}
          />
          <ActionCard
            title="Scan Receipt"
            description="Use OCR to auto-fill expense details"
            icon="📸"
            onClick={() => navigate('/expenses/create?ocr=true')}
          />
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="recent-activity-section">
        <div className="section-header">
          <h3>Recent Expense Claims</h3>
          <button 
            className="btn-link"
            onClick={() => navigate('/expenses/my')}
          >
            View All →
          </button>
        </div>
        
        {myExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h4>No expenses yet</h4>
            <p>Submit your first expense claim to get started</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/expenses/create')}
            >
              Create Your First Expense
            </button>
          </div>
        ) : (
          <div className="expense-cards-list">
            {myExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="expense-card">
                <div className="expense-card-header">
                  <div className="expense-category-badge">{expense.category}</div>
                  <span className={`status-badge status-${expense.status}`}>
                    {expense.status}
                  </span>
                </div>
                <div className="expense-card-body">
                  <h4>{expense.description}</h4>
                  <div className="expense-amount-large">
                    ${expense.amount} <span className="currency">{expense.currency}</span>
                  </div>
                  <div className="expense-date">
                    {new Date(expense.expense_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                {expense.approvals && expense.approvals.length > 0 && (
                  <div className="expense-card-footer">
                    <div className="approval-progress">
                      {expense.approvals.map((approval, idx) => (
                        <div key={idx} className={`approval-step approval-${approval.status}`}>
                          <span className="step-number">{approval.order}</span>
                          <span className="step-name">{approval.approverName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h3>💡 Tips for Faster Approvals</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">📸</span>
            <p>Always attach clear receipt photos</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">✍️</span>
            <p>Provide detailed descriptions</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">⏰</span>
            <p>Submit expenses within 30 days</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">✓</span>
            <p>Choose the correct category</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// Reusable Components
const StatCard = ({ title, value, icon, color, onClick, highlight }) => (
  <div 
    className={`stat-card ${onClick ? 'clickable' : ''} ${highlight ? 'highlight' : ''}`}
    onClick={onClick}
    style={{ borderLeftColor: color }}
  >
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
    </div>
  </div>
);

const ActionCard = ({ title, description, icon, onClick, badge }) => (
  <div className="action-card" onClick={onClick}>
    {badge && <div className="action-badge">{badge}</div>}
    <div className="action-icon">{icon}</div>
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
);

export default EmployeeDashboard