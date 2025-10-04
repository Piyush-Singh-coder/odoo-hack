import React, { useState, useEffect, useCallback } from 'react';
// import { useApprovalStore, useUserStore } from '../../stores';

// Mock dependencies for isolated running
const useApprovalStore = () => ({
    createApprovalRule: async (data) => {
        console.log('Creating Rule:', data);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (data.ruleName.includes('fail')) {
            return { success: false, message: 'Rule creation failed.' };
        }
        return { success: true };
    },
    loading: false,
    error: null,
});

const useUserStore = () => {
    const mockUsers = [
        { id: 1, first_name: 'Admin', last_name: 'User', role: 'admin', email: 'admin@corp.com' },
        { id: 2, first_name: 'Jane', last_name: 'Manager', role: 'manager', email: 'jane.m@corp.com' },
        { id: 3, first_name: 'Joe', last_name: 'Employee', role: 'employee', email: 'joe.e@corp.com' },
        { id: 4, first_name: 'Finance', last_name: 'Head', role: 'manager', email: 'finance@corp.com' },
    ];
    return {
        users: mockUsers,
        fetchUsers: () => console.log('Fetching users...'),
    };
};
// End Mock dependencies

// Reusable Notification component (from UserList/ApprovalRulesList)
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

// Reusable Rule Section Wrapper for visual clarity
const RuleSection = ({ title, children }) => (
    <div className="border border-base-300 rounded-lg p-4 mb-6 bg-base-100 shadow-sm">
        <h4 className="text-lg font-semibold text-primary mb-3 border-b border-base-200 pb-2">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);


const CreateApprovalRuleForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        ruleName: '',
        isManagerApprover: true,
        ruleType: 'sequential',
        percentageThreshold: '',
        specificApproverId: '',
        approvers: [], // Stores user IDs (integers)
    });
    const [notification, setNotification] = useState({ message: '', type: '' });

    const { createApprovalRule, loading, error } = useApprovalStore();
    const { users, fetchUsers } = useUserStore();

    useEffect(() => {
        fetchUsers(); // Fetch users for manager selection
    }, [fetchUsers]); // Assuming fetchUsers is memoized or stable

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const handleApproversChange = useCallback((e) => {
        // Convert selected options values (which are strings) to integers
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
        setFormData(prev => ({
            ...prev,
            approvers: selectedOptions,
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });

        const { ruleType, percentageThreshold, specificApproverId } = formData;
        
        // --- Validation based on rule type ---
        if ((ruleType === 'percentage' || ruleType === 'hybrid') && (!percentageThreshold || isNaN(parseInt(percentageThreshold)))) {
            setNotification({ message: 'Percentage threshold is required and must be a number.', type: 'error' });
            return;
        }
        
        if ((ruleType === 'specific_approver' || ruleType === 'hybrid') && !specificApproverId) {
            setNotification({ message: 'A specific approver must be selected for this rule type.', type: 'error' });
            return;
        }

        const ruleData = {
            ruleName: formData.ruleName,
            isManagerApprover: formData.isManagerApprover,
            ruleType: formData.ruleType,
            percentageThreshold: percentageThreshold ? parseInt(percentageThreshold, 10) : null,
            specificApproverId: specificApproverId ? parseInt(specificApproverId, 10) : null,
            // Ensure approvers is null if empty for API consistency
            approvers: formData.approvers.length > 0 ? formData.approvers : null, 
        };

        const result = await createApprovalRule(ruleData);
        if (result.success) {
            setNotification({ message: 'Approval rule created successfully!', type: 'success' });
            setFormData({
                ruleName: '',
                isManagerApprover: true,
                ruleType: 'sequential',
                percentageThreshold: '',
                specificApproverId: '',
                approvers: [],
            });
            if (onSuccess) onSuccess();
        } else {
            setNotification({ message: result.message || 'Failed to create approval rule.', type: 'error' });
        }
    };

    // Filter users who can be approvers (managers and admins)
    const potentialApprovers = users.filter(u => u.role === 'manager' || u.role === 'admin');

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                    <span className="text-primary">Rule Builder:</span> Create Approval Rule
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Setup */}
                    <RuleSection title="Rule Setup">
                        <div className="form-control">
                            <label className="label">Rule Name</label>
                            <input
                                type="text"
                                name="ruleName"
                                placeholder="e.g., High Value Expense Rule"
                                className="input input-bordered input-primary w-full"
                                value={formData.ruleName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">Rule Type</label>
                            <select
                                name="ruleType"
                                className="select select-bordered select-primary w-full"
                                value={formData.ruleType}
                                onChange={handleChange}
                                required
                            >
                                <option value="sequential">Sequential (Step 1, Step 2, ...)</option>
                                <option value="percentage">Percentage-Based (e.g., 60% of Approvers)</option>
                                <option value="specific_approver">Specific Approver (e.g., CFO auto-approves)</option>
                                <option value="hybrid">Hybrid (Sequential + Conditional Mix)</option>
                            </select>
                        </div>
                    </RuleSection>

                    {/* Manager Checkbox */}
                    <div className="bg-white p-4 rounded-xl shadow-lg flex items-center justify-between">
                        <label className="text-lg font-medium text-gray-700">Include Manager as First Approver?</label>
                        <input
                            type="checkbox"
                            name="isManagerApprover"
                            className="toggle toggle-lg toggle-primary"
                            checked={formData.isManagerApprover}
                            onChange={handleChange}
                            aria-label="Toggle Manager Approver"
                        />
                    </div>
                    
                    {/* Conditional Fields: Percentage/Threshold */}
                    {(formData.ruleType === 'percentage' || formData.ruleType === 'hybrid') && (
                        <RuleSection title="Conditional Approval: Percentage Threshold">
                            <div className="form-control md:col-span-2">
                                <label className="label">Minimum Approval Percentage (%)</label>
                                <input
                                    type="number"
                                    name="percentageThreshold"
                                    placeholder="e.g., 60"
                                    className="input input-bordered input-warning w-full"
                                    value={formData.percentageThreshold}
                                    onChange={handleChange}
                                    min="1"
                                    max="100"
                                    required={formData.ruleType !== 'hybrid'} // Optional if specific approver is selected
                                />
                                <label className="label">
                                    <span className="label-text-alt text-warning">Approval granted if this percentage of assigned approvers approve.</span>
                                </label>
                            </div>
                        </RuleSection>
                    )}
                    
                    {/* Conditional Fields: Specific Approver */}
                    {(formData.ruleType === 'specific_approver' || formData.ruleType === 'hybrid') && (
                        <RuleSection title="Conditional Approval: Specific Approver">
                            <div className="form-control md:col-span-2">
                                <label className="label">Specific Approver (Auto-Approve/Reject)</label>
                                <select
                                    name="specificApproverId"
                                    className="select select-bordered select-error w-full"
                                    value={formData.specificApproverId}
                                    onChange={handleChange}
                                    required={formData.ruleType !== 'hybrid'}
                                >
                                    <option value="">Select Specific Approver...</option>
                                    {potentialApprovers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name} ({user.role})
                                        </option>
                                    ))}
                                </select>
                                <label className="label">
                                    <span className="label-text-alt text-error">If this person approves, the expense may be auto-approved (depending on API logic).</span>
                                </label>
                            </div>
                        </RuleSection>
                    )}

                    {/* Sequential Approvers */}
                    {(formData.ruleType === 'sequential' || formData.ruleType === 'hybrid') && (
                        <RuleSection title="Sequential Approval Steps">
                            <div className="form-control md:col-span-2">
                                <label className="label">Select Approvers (in sequence, hold Ctrl/Cmd to select multiple)</label>
                                <select
                                    multiple
                                    className="select select-bordered w-full h-48 select-info"
                                    onChange={handleApproversChange}
                                    // Map integer array to string array for correct select value matching
                                    value={formData.approvers.map(String)} 
                                    size="5"
                                >
                                    {potentialApprovers.map((user) => (
                                        // Ensure value is a string for the select component
                                        <option key={user.id} value={String(user.id)}>
                                            {user.first_name} {user.last_name} - {user.role}
                                        </option>
                                    ))}
                                </select>
                                <label className="label">
                                    <span className="label-text-alt">Selected: {formData.approvers.length} approver(s)</span>
                                </label>
                            </div>
                        </RuleSection>
                    )}
                    
                    {/* Submit Button */}
                    <div className="pt-4 pb-12">
                        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full shadow-xl">
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Creating Rule...
                                </>
                            ) : (
                                'Create Approval Rule'
                            )}
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="alert alert-error shadow-lg my-4">
                            <div>
                                <span>Error: {error}</span>
                            </div>
                        </div>
                    )}
                </form>
                
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification({ message: '', type: '' })} 
                />
            </div>
        </div>
    );
};

export default CreateApprovalRuleForm;
