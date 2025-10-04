// components/Dashboard/Dashboard.jsx
import React from 'react';
import { useAuthStore } from '../../stores';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Header user={user} />
      <div className="dashboard-content">
        {renderDashboard()}
      </div>
    </div>
  );
};

// Shared Header Component
const Header = ({ user }) => {
  const { logout } = useAuthStore();

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>Expense Management System</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="user-name">{user.firstName} {user.lastName}</span>
          <span className="user-role">{user.role.toUpperCase()}</span>
        </div>
        <button onClick={logout} className="btn-logout">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Dashboard;