import React, { useState, useEffect } from 'react';
// NOTE: Assuming useUserStore and its functions are provided via props or context.
// import { useUserStore } from '../../stores';

// --- MOCK DEPENDENCIES (Placeholders for compilation) ---
// These should be replaced by your actual store implementation.
const Check = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const X = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>;
const AlertCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const Users = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const User = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const Mail = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M22 7l-10 7L2 7"></path></svg>;
const Lock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
// --- END MOCK DEPENDENCIES ---

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

// Helper component for styled input (without icons, as requested)
const InputField = ({ name, type = 'text', placeholder, required = false, isSelect = false, options = [], children, value, onChange }) => {
    const isTextarea = type === 'textarea';

    const InputComponent = isSelect ? 'select' : (isTextarea ? 'textarea' : 'input');
    const inputClasses = isTextarea 
        ? "textarea textarea-bordered w-full focus:ring-2 focus:ring-primary"
        : (isSelect ? "select select-bordered w-full focus:ring-2 focus:ring-primary" : "input input-bordered w-full focus:ring-2 focus:ring-primary");
    
    // Correctly handle props
    const props = {
        name,
        placeholder,
        className: inputClasses,
        onChange: onChange,
        required,
        step: type === 'number' ? '0.01' : undefined,
        rows: isTextarea ? '3' : undefined,
        value: value, 
        disabled: false // Assuming 'loading' state is handled on the button
    };

    if (!isSelect && !isTextarea) {
         props.type = type;
    }
    
    // The select component needs options as children
    const componentChildren = isSelect 
        ? (
            <>
                {children}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}
            </>
        )
        : children;

    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text font-semibold text-gray-700 capitalize">
                    {name.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {required && <span className="label-text-alt text-error">*</span>}
            </label>
            <InputComponent
                {...props}
            >
                {componentChildren}
            </InputComponent>
        </div>
    );
};


const CreateUserForm = ({ onSuccess, createUser, users = [], fetchUsers, loading, error }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        managerId: '',
    });
    const [notification, setNotification] = useState(null);

    // Fetch users for manager selection (functionality preserved)
    useEffect(() => {
        if (fetchUsers) {
            fetchUsers();
        }
    }, [fetchUsers]);

    // Display error notification if one occurs
    useEffect(() => {
        if (error) {
            setNotification({ message: error, type: 'error' });
        }
    }, [error]);

    // Handle input changes (functionality preserved)
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission (functionality preserved, alert replaced)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const userData = {
            ...formData,
            managerId: formData.managerId || null,
        };

        const result = await createUser(userData);
        if (result.success) {
            setNotification({ message: 'User created successfully.', type: 'success' });
            
            // Clear form (functionality preserved)
            setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                role: 'employee',
                managerId: '',
            });
            if (onSuccess) onSuccess();
        }
    };

    // Filter managers for selection (functionality preserved)
    const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

    return (
        <div className="relative min-h-screen flex items-start justify-center bg-gray-50 p-4 font-inter">
            
            {/* Notification System */}
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}
            
            {/* User Creation Card */}
            <div className="card w-full max-w-2xl bg-white shadow-xl rounded-xl border border-gray-200 mt-10 mb-10 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="card-body p-8 sm:p-10">
                    
                    {/* Header */}
                    <div className="flex items-center mb-8 border-b pb-4">
                        <Users className="w-8 h-8 text-primary mr-3" />
                        <h2 className="card-title text-2xl font-extrabold text-gray-800">
                            Create New Employee/Manager
                        </h2>
                    </div>

                    {/* Authentication Details */}
                    <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-dashed pb-2">Login Credentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        
                        {/* Email */}
                        <InputField 
                            name="email" 
                            type="email" 
                            placeholder="user@company.com" 
                            required 
                            value={formData.email}
                            onChange={handleChange}
                        />
                        
                        {/* Password */}
                        <InputField 
                            name="password" 
                            type="password" 
                            placeholder="Secure Password" 
                            required 
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {/* Personal Details */}
                    <h3 className="text-lg font-bold text-gray-700 mb-4 mt-6 border-b border-dashed pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        
                        {/* First Name */}
                        <InputField 
                            name="firstName" 
                            placeholder="First Name" 
                            required 
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        
                        {/* Last Name */}
                        <InputField 
                            name="lastName" 
                            placeholder="Last Name" 
                            required 
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Role and Manager Assignment */}
                    <h3 className="text-lg font-bold text-gray-700 mb-4 mt-6 border-b border-dashed pb-2">Role & Reporting</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        
                        {/* Role */}
                        <InputField 
                            name="role" 
                            isSelect
                            required
                            value={formData.role}
                            onChange={handleChange}
                            options={[
                                { value: 'employee', label: 'Employee' },
                                { value: 'manager', label: 'Manager' },
                                { value: 'admin', label: 'Admin' }, // Assuming admin can create other admins/managers
                            ]}
                        />
                        
                        {/* Manager Selection */}
                        <InputField 
                            name="managerId" 
                            isSelect
                            value={formData.managerId}
                            onChange={handleChange}
                        >
                            <option value="">Select Manager (Optional)</option>
                            {managers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.first_name} {manager.last_name} - {manager.role.toUpperCase()}
                                </option>
                            ))}
                        </InputField>
                    </div>

                    {/* Submit Button */}
                    <div className="form-control mt-8">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`btn btn-primary w-full rounded-lg text-white font-bold text-lg 
                                transition duration-300 transform hover:scale-[1.01] ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-focus'}`}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Creating User...
                                </>
                            ) : (
                                <>
                                    <User className="w-6 h-6 mr-2" />
                                    Create User Account
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateUserForm;
