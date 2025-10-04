import React, { useEffect, useState } from 'react';
// NOTE: Assuming useUserStore is defined elsewhere and is available.
// import { useUserStore } from '../../stores';

// --- MOCK DEPENDENCIES (Placeholders for compilation) ---
// Note: We need the SVG icons defined in CreateUserForm.jsx's mock dependencies
const Check = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const X = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>;
const AlertCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const Trash2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Users = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

const MOCK_USERS = [
    { id: '101', first_name: 'Alice', last_name: 'Smith', email: 'alice@comp.com', role: 'admin', is_active: true, managerId: null, manager_first_name: null, manager_last_name: null },
    { id: '102', first_name: 'Bob', last_name: 'Johnson', email: 'bob@comp.com', role: 'manager', is_active: true, managerId: '101', manager_first_name: 'Alice', manager_last_name: 'Smith' },
    { id: '103', first_name: 'Charlie', last_name: 'Brown', email: 'charlie@comp.com', role: 'employee', is_active: true, managerId: '102', manager_first_name: 'Bob', manager_last_name: 'Johnson' },
    { id: '104', first_name: 'Diana', last_name: 'Prince', email: 'diana@comp.com', role: 'employee', is_active: false, managerId: '102', manager_first_name: 'Bob', manager_last_name: 'Johnson' },
];

const useUserStore = () => {
    const [users, setUsers] = useState(MOCK_USERS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);
        // In a real app, this would update the state with fetched users
    };

    const deleteUser = async (userId) => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        
        if (userId === '101') {
             setError("Cannot deactivate the primary Admin user.");
             return { success: false };
        }
        
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: false } : u));
        return { success: true };
    };

    return { users, loading, error, fetchUsers, deleteUser };
};
// --- END MOCK DEPENDENCIES ---

// Re-using the Notification component structure from CreateUserForm.jsx
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

const UserList = () => {
    const { users, loading, error, fetchUsers, deleteUser } = useUserStore();
    const [notification, setNotification] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null); // State for modal confirmation

    // Fetch users on mount (functionality preserved)
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    // Display error notification if one occurs
    useEffect(() => {
        if (error) {
            setNotification({ message: error, type: 'error' });
        }
    }, [error]);

    // Opens the modal for confirmation
    const handleDeactivateClick = (user) => {
        setUserToDelete(user);
        document.getElementById('deactivation_modal').showModal();
    };

    // Handles the actual deletion (deactivation) logic
    const confirmDelete = async () => {
        if (!userToDelete) return;

        // Close the modal first
        document.getElementById('deactivation_modal').close();

        const result = await deleteUser(userToDelete.id);
        
        if (result.success) {
            // Replaced alert with DaisyUI notification
            setNotification({ message: 'User deactivated successfully!', type: 'success' });
        }
        // Error handling is managed by the useEffect watching the store error state
        setUserToDelete(null); // Clear the temporary user state
    };

    // Helper for status badge styling
    const getStatusBadge = (isActive) => {
        const status = isActive ? 'active' : 'inactive';
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
            Loading users...
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
                        <Users className="w-7 h-7 mr-2 text-primary" /> User Management
                    </h2>
                </div>

                {/* User List */}
                {users.length === 0 ? (
                    <div className="alert alert-info shadow-lg mt-8">
                        <div>
                            <span>No users found.</span>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto shadow-xl rounded-xl">
                        {/* DaisyUI Table styling applied */}
                        <table className="table w-full table-zebra bg-white">
                            {/* Table Header */}
                            <thead>
                                <tr className="bg-base-200 text-gray-600">
                                    <th>Name</th>
                                    <th className="hidden sm:table-cell">Email</th>
                                    <th>Role</th>
                                    <th className="hidden md:table-cell">Manager</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            {/* Table Body */}
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-base-100/50">
                                        
                                        {/* Name */}
                                        <td className="font-medium text-gray-800">
                                            {user.first_name} {user.last_name}
                                        </td>
                                        
                                        {/* Email */}
                                        <td className="text-sm hidden sm:table-cell">{user.email}</td>
                                        
                                        {/* Role */}
                                        <td>
                                            <div className="badge badge-lg badge-outline badge-primary font-semibold py-3 capitalize">
                                                {user.role}
                                            </div>
                                        </td>
                                        
                                        {/* Manager */}
                                        <td className="text-sm text-gray-600 hidden md:table-cell">
                                            {user.manager_first_name && user.manager_last_name
                                                ? `${user.manager_first_name} ${user.manager_last_name}`
                                                : <span className='italic'>N/A</span>}
                                        </td>
                                        
                                        {/* Status */}
                                        <td>{getStatusBadge(user.is_active)}</td>
                                        
                                        {/* Actions */}
                                        <td>
                                            {user.is_active ? (
                                                <button 
                                                    onClick={() => handleDeactivateClick(user)}
                                                    className="btn btn-error btn-sm text-white"
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <div className="text-gray-500 text-sm">Inactive</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* DaisyUI Confirmation Modal */}
            <dialog id="deactivation_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box p-6">
                    <h3 className="font-bold text-xl text-error flex items-center mb-4">
                        <AlertCircle className="w-6 h-6 mr-2" /> Confirm Deactivation
                    </h3>
                    {userToDelete && (
                        <p className="py-4 text-gray-700">
                            Are you sure you want to **deactivate** {userToDelete.first_name} {userToDelete.last_name}? 
                            This user will lose access to the system.
                        </p>
                    )}
                    <div className="modal-action">
                        <form method="dialog">
                            {/* Button to close the modal */}
                            <button className="btn btn-ghost mr-2">Cancel</button>
                        </form>
                        <button 
                            className="btn btn-error text-white" 
                            onClick={confirmDelete}
                            disabled={loading}
                        >
                            Deactivate User
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default UserList;
