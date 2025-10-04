import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./stores";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import CreateUserForm from "./components/users/CreateUserForm";
import UserList from "./components/users/UserList";
import ApprovalRulesList from "./components/approvals/ApprovalRulesList";
import CreateApprovalRuleForm from "./components/approvals/CreateApprovalRuleForm";
import AllExpenses from "./components/admin/AllExpenses";
import CreateExpenseForm from "./components/expenses/CreateExpenseForm";
import MyExpenses from "./components/expenses/MyExpenses";
import PendingApprovals from "./components/approvals/PendingApprovals";
import Dashboard from "./components/Dashboard/Dashboard";


const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        
        <Route path="/signup" element={<ProtectedRoute requiredRole="admin">
              <SignupForm />
            </ProtectedRoute>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/create"
          element={
            <ProtectedRoute requiredRole="admin">
              <CreateUserForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approval-rules"
          element={
            <ProtectedRoute requiredRole="admin">
              <ApprovalRulesList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approval-rules/create"
          element={
            <ProtectedRoute requiredRole="admin">
              <CreateApprovalRuleForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses/all"
          element={
            <ProtectedRoute requiredRole="admin">
              <AllExpenses />
            </ProtectedRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/expenses/create"
          element={
            <ProtectedRoute>
              <CreateExpenseForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses/my"
          element={
            <ProtectedRoute>
              <MyExpenses />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/approvals/pending"
          element={
            <ProtectedRoute requiredRole="manager">
              <PendingApprovals />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      </Routes>
    </Router>
  );
};

export default App;
