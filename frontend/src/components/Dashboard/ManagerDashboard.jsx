// components/Dashboard/ManagerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../../stores';
import { StatCard, ActionCard } from './SharedComponents'; // Import shared components
import './Dashboard.css';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const { pendingApprovals, myExpenses, fetchPendingApprovals, fetchMyExpenses } = useExpenseStore();
  
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    myPendingExpenses: 0,
    myApprovedExpenses: 0,
    myRejectedExpenses: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      fetchPendingApprovals(),
      fetchMyExpenses(),
    ]);
  };

  useEffect(() => {
    if (pendingApprovals && myExpenses) {
      setStats({
        pendingApprovals: pendingApprovals.length,
        myPendingExpenses: myExpenses.filter(e => e.status === 'pending').length,
        myApprovedExpenses: myExpenses.filter(e => e.status === 'approved').length,
        myRejectedExpenses: myExpenses.filter(e => e.status === 'rejected').length,
      });
    }
  }, [pendingApprovals, myExpenses]);

  return (
    <div className="manager-dashboard">
      <div className="dashboard-header-section">
        <h2>Manager Dashboard</h2>
        <p className="subtitle">Review team expenses and manage your own</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon="⏳"
          color="#f59e0b"
          onClick={() => navigate('/approvals/pending')}
          highlight={stats.pendingApprovals > 0}
        />
        <StatCard
          title="My Pending"
          value={stats.myPendingExpenses}
          icon="💰"
          color="#8b5cf6"
          onClick={() => navigate('/expenses/my?status=pending')}
        />
        <StatCard
          title="My Approved"
          value={stats.myApprovedExpenses}
          icon="✅"
          color="#10b981"
        />
        <StatCard
          title="My Rejected"
          value={stats.myRejectedExpenses}
          icon="❌"
          color="#ef4444"
        />
      </div>

      {/* Priority Section - Pending Approvals */}
      {stats.pendingApprovals > 0 && (
        <div className="priority-section">
          <div className="priority-header">
            <h3>⚠️ Action Required - Pending Approvals ({stats.pendingApprovals})</h3>
            <button 
              className="btn-primary"
              onClick={() => navigate('/approvals/pending')}
            >
              Review All
            </button>
          </div>
          <div className="approval-preview-list">
            {pendingApprovals.slice(0, 3).map((approval) => (
              <div key={approval.id} className="approval-preview-card">
                <div className="approval-header">
                  <div className="employee-info">
                    <span className="employee-name">
                      {approval.employee_first_name} {approval.employee_last_name}
                    </span>
                    <span className="expense-category">{approval.category}</span>
                  </div>
                  <span className="expense-amount">${approval.converted_amount}</span>
                </div>
                <div className="approval-details">
                  <span className="expense-date">
                    {new Date(approval.expense_date).toLocaleDateString()}
                  </span>
                  <span className="step-info">Step {approval.step_order}</span>
                </div>
                <p className="expense-description">{approval.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="action-cards-grid">
          <ActionCard
            title="Review Approvals"
            description="Review and approve team expenses"
            icon="✓"
            badge={stats.pendingApprovals > 0 ? stats.pendingApprovals : null}
            onClick={() => navigate('/approvals/pending')}
          />
          <ActionCard
            title="Submit Expense"
            description="Create a new expense claim"
            icon="➕"
            onClick={() => navigate('/expenses/create')}
          />
          <ActionCard
            title="My Expenses"
            description="View your expense history"
            icon="📋"
            onClick={() => navigate('/expenses/my')}
          />
          <ActionCard
            title="Approval Rules"
            description="View active approval workflows"
            icon="⚙️"
            onClick={() => navigate('/approval-rules')}
          />
        </div>
      </div>

      {/* My Recent Expenses */}
      <div className="recent-activity-section">
        <h3>My Recent Expenses</h3>
        <div className="activity-list">
          {myExpenses.slice(0, 5).map((expense) => (
            <div key={expense.id} className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-details">
                <div className="activity-title">
                  {expense.category} - {expense.description}
                </div>
                <div className="activity-meta">
                  ${expense.amount} {expense.currency} • {new Date(expense.expense_date).toLocaleDateString()}
                </div>
              </div>
              <span className={`status-badge status-${expense.status}`}>
                {expense.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;