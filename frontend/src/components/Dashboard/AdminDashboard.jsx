import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore, useUserStore, useApprovalStore } from '../../stores';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: 0,
  });

  const { allExpenses, fetchAllExpenses } = useExpenseStore();
  const { users, fetchUsers } = useUserStore();
  const { approvalRules, fetchApprovalRules } = useApprovalStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      fetchAllExpenses(),
      fetchUsers(),
      fetchApprovalRules(),
    ]);
  };

  useEffect(() => {
    if (allExpenses.length > 0) {
      const pending = allExpenses.filter(e => e.status === 'pending').length;
      const approved = allExpenses.filter(e => e.status === 'approved').length;
      const rejected = allExpenses.filter(e => e.status === 'rejected').length;
      const total = allExpenses.reduce((sum, e) => sum + parseFloat(e.converted_amount || 0), 0);

      setStats({
        totalUsers: users.length,
        totalExpenses: allExpenses.length,
        pendingExpenses: pending,
        approvedExpenses: approved,
        rejectedExpenses: rejected,
        totalAmount: total.toFixed(2),
      });
    }
  }, [allExpenses, users]);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header-section">
        <h2>Admin Dashboard</h2>
        <p className="subtitle">Manage your organization's expense system</p>
      </div>

      {/* Statistics Cards */}
      {/* <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="#3b82f6"
          onClick={() => navigate('/users')}
        />
        <StatCard
          title="Total Expenses"
          value={stats.totalExpenses}
          icon="💰"
          color="#8b5cf6"
          onClick={() => navigate('/expenses/all')}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingExpenses}
          icon="⏳"
          color="#f59e0b"
          onClick={() => navigate('/expenses/all?status=pending')}
        />
        <StatCard
          title="Approved"
          value={stats.approvedExpenses}
          icon="✅"
          color="#10b981"
        />
        <StatCard
          title="Rejected"
          value={stats.rejectedExpenses}
          icon="❌"
          color="#ef4444"
        />
        <StatCard
          title="Total Amount"
          value={`$${stats.totalAmount}`}
          icon="💵"
          color="#06b6d4"
        />
      </div> */}

      {/* Quick Actions */}
      {/* <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="action-cards-grid">
          <ActionCard
            title="Manage Users"
            description="Create, edit, and manage employee accounts"
            icon="👤"
            onClick={() => navigate('/users')}
          />
          <ActionCard
            title="Create User"
            description="Add new employees or managers"
            icon="➕"
            onClick={() => navigate('/users/create')}
          />
          <ActionCard
            title="Approval Rules"
            description="Configure expense approval workflows"
            icon="⚙️"
            onClick={() => navigate('/approval-rules')}
          />
          <ActionCard
            title="Create Rule"
            description="Set up new approval workflows"
            icon="📋"
            onClick={() => navigate('/approval-rules/create')}
          />
          <ActionCard
            title="All Expenses"
            description="View and manage all company expenses"
            icon="📊"
            onClick={() => navigate('/expenses/all')}
          />
          <ActionCard
            title="Reports"
            description="Generate expense reports and analytics"
            icon="📈"
            onClick={() => alert('Reports feature coming soon!')}
          />
        </div>
      </div> */}

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h3>Recent Expenses</h3>
        <div className="activity-list">
          {allExpenses.slice(0, 5).map((expense) => (
            <div key={expense.id} className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-details">
                <div className="activity-title">
                  {expense.employee_first_name} {expense.employee_last_name} - {expense.category}
                </div>
                <div className="activity-meta">
                  ${expense.converted_amount} • {new Date(expense.expense_date).toLocaleDateString()}
                </div>
              </div>
              <span className={`status-badge status-${expense.status}`}>
                {expense.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Approval Rules Summary */}
      <div className="rules-summary-section">
        <h3>Active Approval Rules</h3>
        <div className="rules-list">
          {approvalRules.filter(rule => rule.is_active).map((rule) => (
            <div key={rule.id} className="rule-item">
              <div className="rule-icon">📋</div>
              <div className="rule-details">
                <div className="rule-name">{rule.rule_name}</div>
                <div className="rule-type">{rule.rule_type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard
