import React, { useEffect, useState } from 'react';
// NOTE: Assuming useExpenseStore is defined elsewhere and is available.
// import { useExpenseStore } from '../../stores';

// --- MOCK DEPENDENCIES (for isolated running) ---
const MOCK_EXPENSES = [
    {
        id: 101,
        expense_date: '2025-09-28',
        category: 'Travel',
        description: 'Train ticket to Berlin',
        amount: 89.99,
        currency: 'EUR',
        converted_amount: '96.50 USD',
        status: 'approved',
        approvals: [
            { order: 1, approverName: 'Jane Doe (Manager)', status: 'Approved' },
            { order: 2, approverName: 'Finance Team', status: 'Pending' },
        ],
    },
    {
        id: 102,
        expense_date: '2025-09-29',
        category: 'Food',
        description: 'Lunch with prospect',
        amount: 35.00,
        currency: 'USD',
        status: 'pending',
        approvals: [
            { order: 1, approverName: 'Jane Doe (Manager)', status: 'Pending' },
        ],
    },
    {
        id: 103,
        expense_date: '2025-09-30',
        category: 'Software',
        description: 'Annual cloud subscription',
        amount: 499.00,
        currency: 'GBP',
        converted_amount: '620.00 USD',
        status: 'rejected',
        approvals: [
            { order: 1, approverName: 'Jane Doe (Manager)', status: 'Approved' },
            { order: 2, approverName: 'Finance Team', status: 'Rejected' },
        ],
    },
];

const useExpenseStore = () => {
    const [myExpenses, setMyExpenses] = useState(MOCK_EXPENSES);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyExpenses = async (status) => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800));

        const filtered = status
            ? MOCK_EXPENSES.filter(e => e.status === status)
            : MOCK_EXPENSES;

        setMyExpenses(filtered);
        setLoading(false);
    };

    return { myExpenses, loading, error, fetchMyExpenses };
};
// --- END MOCK DEPENDENCIES ---


const MyExpenses = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const { myExpenses, loading, error, fetchMyExpenses } = useExpenseStore();

    // Functionality preserved
    useEffect(() => {
        fetchMyExpenses(statusFilter || null);
    }, [statusFilter]);

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
                
                {/* Header and Filter */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">My Expense History</h2>
                    
                    {/* Filter Dropdown */}
                    <div className="form-control w-full sm:w-auto">
                        <label className="label hidden sm:block">
                            <span className="label-text text-gray-600 font-medium">Filter by Status:</span>
                        </label>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="select select-bordered select-sm w-full font-medium"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Expense List */}
                {myExpenses.length === 0 ? (
                    <div className="alert alert-info shadow-lg mt-8">
                        <div>
                            <span>You have not submitted any expenses yet.</span>
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
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount (Local)</th>
                                    <th>Status</th>
                                    <th>Approval Steps</th>
                                </tr>
                            </thead>
                            {/* Table Body */}
                            <tbody>
                                {myExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-base-100/50">
                                        
                                        {/* Date */}
                                        <td>
                                            <div className="font-medium">
                                                {new Date(expense.expense_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        
                                        {/* Category */}
                                        <td className="font-medium text-gray-700">{expense.category}</td>
                                        
                                        {/* Description (Hidden on extra small screens) */}
                                        <td className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap hidden sm:table-cell">
                                            {expense.description}
                                        </td>
                                        
                                        {/* Amount */}
                                        <td>
                                            <div className="font-bold text-lg text-primary">
                                                {expense.amount} {expense.currency}
                                            </div>
                                            {expense.converted_amount && (
                                                <small className="text-gray-500 block">
                                                    ({expense.converted_amount})
                                                </small>
                                            )}
                                        </td>
                                        
                                        {/* Status */}
                                        <td>{getStatusBadge(expense.status)}</td>
                                        
                                        {/* Approvals */}
                                        <td>
                                            {expense.approvals && expense.approvals.length > 0 ? (
                                                <ul className="list-none m-0 p-0 text-xs space-y-1">
                                                    {expense.approvals.map((approval, idx) => {
                                                        const approvalClass = approval.status.toLowerCase() === 'approved' ? 'text-success' : 
                                                                              approval.status.toLowerCase() === 'rejected' ? 'text-error' : 
                                                                              'text-warning';
                                                        return (
                                                            <li key={idx} className={`flex items-center ${approvalClass}`}>
                                                                <span className="font-semibold w-12 mr-1">Step {approval.order}:</span> 
                                                                {approval.approverName.split(' ')[0]} - 
                                                                <span className="font-bold ml-1">{approval.status}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
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

export default MyExpenses;
