import React, { useEffect, useState } from 'react';
// NOTE: Assuming useApprovalStore is defined elsewhere and is available.
// import { useApprovalStore } from '../../stores';

// --- MOCK DEPENDENCIES (Re-used for isolated running) ---
const Check = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const X = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>;
const AlertCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const Settings = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.09a2 2 0 0 0-2.73.73l-.75 1.3a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.73v.44a2 2 0 0 1-2 2v.18a2 2 0 0 0-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.09a2 2 0 0 0-2.73.73l-.75 1.3a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.73v.44a2 2 0 0 1 2 2v.18a2 2 0 0 0 2 1.73l.43.25a2 2 0 0 1 2 0l.15-.09a2 2 0 0 0 2.73.73l.75 1.3a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.73v.44a2 2 0 0 1 2 2v.18a2 2 0 0 0 2 1.73l.43.25a2 2 0 0 1 2 0l.15-.09a2 2 0 0 0 2.73-.73l.75-1.3a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.73v-.44a2 2 0 0 1 2-2v-.18a2 2 0 0 0 1-1.73l.43-.25a2 2 0 0 1 2-2l.15.09a2 2 0 0 0 2.73-.73l.75-1.3a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.73v-.44a2 2 0 0 1-2-2v-.18a2 2 0 0 0-2-1.73l-.43-.25a2 2 0 0 1-2-2v-.44a2 2 0 0 1-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;


const MOCK_RULES = [
    { id: 'R1', rule_name: 'Standard Manager Approval', rule_type: 'Basic', is_manager_approver: true, is_active: true, percentage_threshold: null, specific_approver_first_name: null, specific_approver_last_name: null, approvalSteps: [] },
    { id: 'R2', rule_name: 'High Value Expenses (>$500)', rule_type: 'Multi-Step', is_manager_approver: false, is_active: true, percentage_threshold: null, specific_approver_first_name: null, specific_approver_last_name: null, approvalSteps: [
        { step_order: 1, first_name: 'Finance', last_name: 'Lead', email: 'finance@comp.com' },
        { step_order: 2, first_name: 'Director', last_name: 'Global', email: 'director@comp.com' }
    ] },
    { id: 'R3', rule_name: 'CFO Auto-Approval (Hybrid)', rule_type: 'Hybrid', is_manager_approver: false, is_active: true, percentage_threshold: 60, specific_approver_first_name: 'Chief', specific_approver_last_name: 'Finance', approvalSteps: [] },
    { id: 'R4', rule_name: 'Testing Rule', rule_type: 'Basic', is_manager_approver: true, is_active: false, percentage_threshold: null, specific_approver_first_name: null, specific_approver_last_name: null, approvalSteps: [] },
];

const useApprovalStore = () => {
    const [approvalRules, setApprovalRules] = useState(MOCK_RULES);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchApprovalRules = async () => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);
    };

    const updateApprovalRule = async (ruleId, updates) => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
        
        setApprovalRules(prev => prev.map(r => r.id === ruleId ? { ...r, ...updates } : r));
        return { success: true };
    };

    return { approvalRules, loading, error, fetchApprovalRules, updateApprovalRule };
};
// --- END MOCK DEPENDENCIES ---

// Notification Component (Re-used from UserList.jsx)
const Notification = ({ message, type, onClose }) => {
    const icon = type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />;
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';

    return (
        <div className={`alert ${alertClass} shadow-lg absolute top-4 right-4 z-50 w-full max-w-sm`}>
            {icon}
            <div>
                <h3 className="font-bold capitalize">{type}!</h3>
                <div className="text-xs">{message}</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={onClose}>
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const ApprovalRulesList = () => {
    const { approvalRules, loading, error, fetchApprovalRules, updateApprovalRule } = useApprovalStore();
    const [notification, setNotification] = useState(null);

    // Fetch approval rules on mount (functionality preserved)
    useEffect(() => {
        fetchApprovalRules();
    }, [fetchApprovalRules]);
    
    // Display error notification if one occurs
    useEffect(() => {
        if (error) {
            setNotification({ message: error, type: 'error' });
        }
    }, [error]);

    // Handles activation/deactivation of a rule (functionality preserved, alert replaced)
    const handleToggleActive = async (ruleId, currentStatus) => {
        const action = currentStatus ? 'Deactivating' : 'Activating';
        
        const result = await updateApprovalRule(ruleId, { is_active: !currentStatus });
        
        if (result.success) {
            setNotification({ message: `Rule ${action.toLowerCase().replace('ing', 'ed')} successfully!`, type: 'success' });
        }
        // Note: Error handled by the useEffect watching store error
    };
    
    // Helper for status badge styling
    const getStatusBadge = (isActive) => {
        const status = isActive ? 'Active' : 'Inactive';
        const className = isActive ? 'badge-success' : 'badge-error';
        return (
            <div className={`badge ${className} badge-outline font-semibold text-xs py-3 capitalize`}>
                {status}
            </div>
        );
    };

    // Responsive loading state
    if (loading) return (
        <div className="flex justify-center items-center min-h-[300px] text-lg text-gray-500">
            <span className="loading loading-spinner loading-lg mr-3"></span>
            Loading approval rules...
        </div>
    );

    return (
        <div className="relative p-4 sm:p-8 bg-gray-50 min-h-screen">
            
            {/* Notification System */}
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}

            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                        <Settings className="w-7 h-7 mr-2 text-warning" /> Expense Approval Rules
                    </h2>
                    {/* Add Rule Button Placeholder */}
                    <button className="btn btn-warning btn-sm text-white">
                        + New Rule
                    </button>
                </div>

                {/* Rules List */}
                {approvalRules.length === 0 ? (
                    <div className="alert alert-info shadow-lg mt-8">
                        <div>
                            <span>No approval rules found. Please create one.</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {approvalRules.map((rule) => (
                            <div key={rule.id} className="card bg-white shadow-xl rounded-xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-2xl">
                                
                                {/* Rule Header */}
                                <div className="flex justify-between items-start mb-4 border-b pb-3">
                                    <h3 className="card-title text-xl font-bold text-gray-800 leading-tight">
                                        {rule.rule_name}
                                    </h3>
                                    {getStatusBadge(rule.is_active)}
                                </div>
                                
                                {/* Rule Details */}
                                <div className="space-y-3 text-sm text-gray-700">
                                    
                                    <p>
                                        <strong className="text-gray-900">Type:</strong> 
                                        <span className='badge badge-info badge-outline ml-2 capitalize'>{rule.rule_type}</span>
                                    </p>
                                    
                                    <p>
                                        <strong className="text-gray-900">Manager Approver:</strong> 
                                        <span className={`font-semibold ml-2 ${rule.is_manager_approver ? 'text-success' : 'text-error'}`}>
                                            {rule.is_manager_approver ? 'Yes (First Step)' : 'No'}
                                        </span>
                                    </p>
                                    
                                    {rule.percentage_threshold && (
                                        <p>
                                            <strong className="text-gray-900">Threshold:</strong> 
                                            <span className='font-semibold ml-2 text-primary'>{rule.percentage_threshold}% Approval</span>
                                        </p>
                                    )}
                                    
                                    {rule.specific_approver_first_name && (
                                        <p>
                                            <strong className="text-gray-900">Specific Approver:</strong> 
                                            <span className='font-semibold ml-2 text-warning'>
                                                {rule.specific_approver_first_name} {rule.specific_approver_last_name}
                                            </span>
                                        </p>
                                    )}
                                    
                                    {/* Approval Steps (if multi-step) */}
                                    {rule.approvalSteps && rule.approvalSteps.length > 0 && (
                                        <div className='pt-2 border-t border-dashed'>
                                            <p className='text-gray-900 font-bold mb-1'>Approval Steps:</p>
                                            <ol className='list-decimal list-inside text-xs text-gray-600 space-y-1'>
                                                {rule.approvalSteps.map((step) => (
                                                    <li key={step.step_order}>
                                                        {step.first_name} {step.last_name}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button (Toggle) */}
                                <div className='card-actions justify-end mt-4'>
                                    <button 
                                        onClick={() => handleToggleActive(rule.id, rule.is_active)}
                                        disabled={loading}
                                        className={`btn btn-sm w-full ${rule.is_active ? 'btn-error' : 'btn-success'} text-white`}
                                    >
                                        {rule.is_active ? 'Deactivate Rule' : 'Activate Rule'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovalRulesList;
