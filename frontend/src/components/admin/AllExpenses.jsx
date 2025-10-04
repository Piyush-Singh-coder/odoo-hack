import React, { useEffect, useState } from 'react';
// NOTE: Assuming useExpenseStore and useUserStore are defined elsewhere and are available.
// import { useExpenseStore, useUserStore } from '../../stores';

// --- MOCK DEPENDENCIES (for isolated running) ---
const MOCK_USERS = [
    { id: 'emp-1', first_name: 'Alice', last_name: 'Smith', role: 'employee' },
    { id: 'emp-2', first_name: 'Bob', last_name: 'Johnson', role: 'employee' },
    { id: 'mgr-1', first_name: 'Charlie', last_name: 'Brown', role: 'manager' },
];

const MOCK_ALL_EXPENSES = [
    {
        id: 201, employeeId: 'emp-1', employee_first_name: 'Alice', employee_last_name: 'Smith',
        expense_date: '2025-10-01', category: 'Software', description: 'Monthly SaaS subscription',
        amount: 50.00, currency: 'USD', converted_amount: '50.00 USD', status: 'approved', receipt_path: 'receipts/201.jpg',
    },
    {
        id: 202, employeeId: 'emp-2', employee_first_name: 'Bob', employee_last_name: 'Johnson',
        expense_date: '2025-09-25', category: 'Travel', description: 'Flight to NYC',
        amount: 450.00, currency: 'EUR', converted_amount: '480.00 USD', status: 'pending', receipt_path: 'receipts/202.jpg',
    },
    {
        id: 203, employeeId: 'emp-1', employee_first_name: 'Alice', employee_last_name: 'Smith',
        expense_date: '2025-09-30', category: 'Food', description: 'Client Dinner',
        amount: 120.00, currency: 'USD', converted_amount: '120.00 USD', status: 'rejected', receipt_path: null,
    },
];

const useExpenseStore = () => {
    const [allExpenses, setAllExpenses] = useState(MOCK_ALL_EXPENSES);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAllExpenses = async (filters) => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800));

        let filtered = MOCK_ALL_EXPENSES;

        if (filters.status) {
            filtered = filtered.filter(e => e.status === filters.status);
        }
        if (filters.employeeId) {
            filtered = filtered.filter(e => e.employeeId === filters.employeeId);
        }

        setAllExpenses(filtered);
        setLoading(false);
    };

    return { allExpenses, loading, error, fetchAllExpenses };
};

const useUserStore = () => {
    const [users, setUsers] = useState([]);
    const fetchUsers = () => setUsers(MOCK_USERS);
    return { users, fetchUsers };
};
// --- END MOCK DEPENDENCIES ---


const AllExpenses = () => {
    const [filters, setFilters] = useState({
        status: '',
        employeeId: '',
    });

    const { allExpenses, loading, error, fetchAllExpenses } = useExpenseStore();
    const { users, fetchUsers } = useUserStore();

    // Fetch users (functionality preserved)
    useEffect(() => {
        if (fetchUsers) {
            fetchUsers();
        }
    }, [fetchUsers]);

    // Fetch expenses based on filters (functionality preserved)
    useEffect(() => {
        const filterParams = {};
        if (filters.status) filterParams.status = filters.status;
        if (filters.employeeId) filterParams.employeeId = filters.employeeId;
        
        fetchAllExpenses(filterParams);
    }, [filters, fetchAllExpenses]);

    // Filter handler (functionality preserved)
    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    // Updated to use DaisyUI badges (functionality preserved)
    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'PENDING', className: 'badge-warning' },
            approved: { label: 'APPROVED', className: 'badge-success' },
            rejected: { label: 'REJECTED', className: 'badge-error' },
        };
        const { label, className } = statusMap[status] || { label: 'UNKNOWN', className: 'badge-neutral' };

        return (
            <div className={`badge ${className} badge-outline font-semibold text-xs py-3 capitalize`}>
                {label}
            </div>
        );
    };

    // Responsive loading state
    if (loading) return (
        <div className="flex justify-center items-center min-h-[300px] text-lg text-gray-500">
            <span className="loading loading-spinner loading-lg mr-3"></span>
            Loading expenses...
        </div>
    );

    // Responsive error state
    if (error) return (
        <div className="alert alert-error shadow-lg max-w-lg mx-auto mt-10">
            <div>
                <span>Error: {error}</span>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                
                {/* Header and Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">All Company Expenses</h2>
                    
                    {/* Filters Container */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        
                        {/* Status Filter */}
                        <div className="form-control w-full sm:w-48">
                            <label className="label hidden sm:block">
                                <span className="label-text text-gray-600 font-medium">Status:</span>
                            </label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="select select-bordered select-sm w-full font-medium"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        
                        {/* Employee Filter */}
                        <div className="form-control w-full sm:w-48">
                            <label className="label hidden sm:block">
                                <span className="label-text text-gray-600 font-medium">Employee:</span>
                            </label>
                            <select
                                name="employeeId"
                                value={filters.employeeId}
                                onChange={handleFilterChange}
                                className="select select-bordered select-sm w-full font-medium"
                            >
                                <option value="">All Employees</option>
                                {users.filter(u => u.role === 'employee').map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Expense List */}
                {allExpenses.length === 0 ? (
                    <div className="alert alert-info shadow-lg mt-8">
                        <div>
                            <span>No expenses found matching the current filters.</span>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto shadow-xl rounded-xl">
                        {/* DaisyUI Table styling applied */}
                        <table className="table w-full table-zebra bg-white">
                            {/* Table Header */}
                            <thead>
                                <tr className="bg-base-200 text-gray-600">
                                    <th>Date</th>
                                    <th>Employee</th>
                                    <th>Category</th>
                                    <th className="hidden lg:table-cell">Description</th>
                                    <th>Amount (Company Currency)</th>
                                    <th>Status</th>
                                    <th>Receipt</th>
                                </tr>
                            </thead>
                            {/* Table Body */}
                            <tbody>
                                {allExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-base-100/50">
                                        
                                        {/* Date */}
                                        <td>
                                            <div className="font-medium">
                                                {new Date(expense.expense_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        
                                        {/* Employee */}
                                        <td className="font-medium text-gray-700">
                                            {expense.employee_first_name} {expense.employee_last_name}
                                        </td>
                                        
                                        {/* Category */}
                                        <td className="text-sm">{expense.category}</td>

                                        {/* Description (Hidden on medium screens) */}
                                        <td className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-sm hidden lg:table-cell">
                                            {expense.description}
                                        </td>
                                        
                                        {/* Amount */}
                                        <td>
                                            <div className="font-bold text-lg text-secondary">
                                                {expense.converted_amount}
                                            </div>
                                            <small className="text-gray-500 block">
                                                ({expense.amount} {expense.currency})
                                            </small>
                                        </td>
                                        
                                        {/* Status */}
                                        <td>{getStatusBadge(expense.status)}</td>
                                        
                                        {/* Receipt */}
                                        <td>
                                            {expense.receipt_path ? (
                                                <a 
                                                    href={`http://localhost:5000/${expense.receipt_path}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn btn-xs btn-outline btn-info hover:btn-info"
                                                >
                                                    View Receipt
                                                </a>
                                            ) : (
                                                <div className="text-gray-500 italic text-sm">N/A</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllExpenses;
