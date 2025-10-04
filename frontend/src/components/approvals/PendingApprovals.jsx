import React, { useEffect, useState, useCallback } from 'react';
const useExpenseStore = () => {
    const mockApprovals = [
        { 
            id: 101, 
            expense_id: 1,
            employee_first_name: 'Joe', 
            employee_last_name: 'Employee', 
            converted_amount: 150.00,
            amount: 100, 
            currency: 'EUR', 
            category: 'Travel', 
            description: 'Flight to Berlin for client meeting.',
            expense_date: '2025-10-01T00:00:00Z', 
            step_order: 2,
            receipt_path: 'receipts/101.jpg' 
        },
        { 
            id: 102, 
            expense_id: 2,
            employee_first_name: 'Alice', 
            employee_last_name: 'Smith', 
            converted_amount: 45.50,
            amount: 50, 
            currency: 'USD', 
            category: 'Food', 
            description: 'Team lunch for project launch.',
            expense_date: '2025-09-30T00:00:00Z', 
            step_order: 1,
            receipt_path: null 
        },
    ];
    return {
        pendingApprovals: mockApprovals,
        loading: false,
        error: null,
        fetchPendingApprovals: () => console.log('Fetching pending approvals...'),
        approveOrRejectExpense: async (id, action, comment) => {
            console.log(`Expense ${id} - Action: ${action}, Comment: ${comment}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            if (action === 'reject' && !comment) {
                 return { success: false, message: 'Rejection requires comment.' };
            }
            return { success: true, message: `Expense ${id} ${action}ed.` };
        },
    };
};
// End Mock dependencies

// Reusable Notification component (reused from other files)
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    
    const alertClass = type === 'error' 
        ? 'alert-error' 
        : 'alert-success';

    return (
        <div className="toast toast-end z-50">
            <div className={`alert ${alertClass} shadow-lg rounded-xl`}>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">{type === 'error' ? 'Error' : 'Success'}</span>
                    <span className="text-xs">{message}</span>
                </div>
                <button 
                    className="btn btn-sm btn-ghost"
                    onClick={onClose}
                    aria-label="Close notification"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};


const PendingApprovals = () => {
    // comments state maps expenseId to comment string
    const [comments, setComments] = useState({});
    const [notification, setNotification] = useState({ message: '', type: '' });

    const { pendingApprovals, loading, error, fetchPendingApprovals, approveOrRejectExpense } = useExpenseStore();

    useEffect(() => {
        fetchPendingApprovals();
    }, [fetchPendingApprovals]); // Dependency array assumes fetchPendingApprovals is stable

    const handleApprove = async (expenseId) => {
        setNotification({ message: '', type: '' });
        
        const result = await approveOrRejectExpense(
            expenseId,
            'approve',
            comments[expenseId] || ''
        );
        
        if (result.success) {
            setNotification({ message: 'Expense approved successfully!', type: 'success' });
            setComments(prev => ({ ...prev, [expenseId]: '' }));
            fetchPendingApprovals(); // Refresh list after action
        } else {
            setNotification({ message: result.message || 'Failed to approve expense.', type: 'error' });
        }
    };

    const handleReject = async (expenseId) => {
        setNotification({ message: '', type: '' });

        if (!comments[expenseId] || comments[expenseId].trim() === '') {
            setNotification({ message: 'Please provide a comment for rejection.', type: 'error' });
            return;
        }
        
        const result = await approveOrRejectExpense(
            expenseId,
            'reject',
            comments[expenseId]
        );
        
        if (result.success) {
            setNotification({ message: 'Expense rejected successfully.', type: 'success' });
            setComments(prev => ({ ...prev, [expenseId]: '' }));
            fetchPendingApprovals(); // Refresh list after action
        } else {
            setNotification({ message: result.message || 'Failed to reject expense.', type: 'error' });
        }
    };

    const handleCommentChange = useCallback((expenseId, value) => {
        setComments(prev => ({
            ...prev,
            [expenseId]: value,
        }));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-40">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );
    
    if (error) return (
        <div className="alert alert-error shadow-lg my-4 max-w-4xl mx-auto">
            <span>Error: {error}</span>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-3">
                    <span className="text-warning">Action Required:</span> Pending Approvals
                </h2>
                
                {pendingApprovals.length === 0 ? (
                    <div className="alert alert-info shadow-lg rounded-xl">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>No expenses currently require your approval. Great job!</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pendingApprovals.map((approval) => (
                            <div key={approval.id} className="card bg-white shadow-xl rounded-xl border border-warning/50">
                                <div className="card-body p-5 md:p-8">
                                    <div className="flex justify-between items-start mb-4 border-b pb-3">
                                        <h3 className="card-title text-xl font-semibold">
                                            Expense from {approval.employee_first_name} {approval.employee_last_name}
                                        </h3>
                                        <div className="badge badge-warning text-xs md:text-sm p-3">
                                            Approval Step {approval.step_order}
                                        </div>
                                    </div>
                                    
                                    {/* Expense Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-sm text-gray-700 mb-6">
                                        <div>
                                            <p className="font-bold text-lg text-error">
                                                {approval.converted_amount}
                                            </p>
                                            <span className="text-xs text-gray-500">Company Currency</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">Original:</p>
                                            <span className="text-sm">{approval.amount} {approval.currency}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">Category:</p>
                                            <span className="text-sm">{approval.category}</span>
                                        </div>
                                        <div className="col-span-2 md:col-span-3">
                                            <p className="font-medium text-gray-600">Description:</p>
                                            <span className="text-sm italic">{approval.description}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">Date:</p>
                                            <span className="text-sm">{new Date(approval.expense_date).toLocaleDateString()}</span>
                                        </div>
                                        {approval.receipt_path && (
                                            <div className="self-center">
                                                <a 
                                                    href={`http://localhost:5000/${approval.receipt_path}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-info btn-outline text-xs"
                                                >
                                                    View Receipt
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Area */}
                                    <div className="border-t pt-4 space-y-3">
                                        <textarea
                                            placeholder="Add comments (optional for approval, required for rejection)"
                                            className="textarea textarea-bordered w-full resize-none"
                                            value={comments[approval.id] || ''}
                                            onChange={(e) => handleCommentChange(approval.id, e.target.value)}
                                            rows="2"
                                        />
                                        
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => handleApprove(approval.id)}
                                                className="btn btn-success text-white min-w-[8rem]"
                                                disabled={loading}
                                            >
                                                Approve
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleReject(approval.id)}
                                                className="btn btn-error text-white min-w-[8rem]"
                                                disabled={loading}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: '' })} 
            />
        </div>
    );
};

export default PendingApprovals;
