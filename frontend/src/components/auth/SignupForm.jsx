import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// NOTE: Assuming useAuthStore is defined elsewhere and is available in the environment
// We keep the original imports for functionality preservation.
// import { useAuthStore } from '../../stores'; 

// Import Lucide React icons
import { Mail, Lock, User, Briefcase, Globe, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores';

// Mock the external dependencies to make this file runnable in an isolated environment
// In a real project, you would delete this mock code:
// =========================================================================


// const useNavigate = () => (path) => {
//     console.log(`Navigating to: ${path}`);
//     // You'd replace this with the actual navigation logic in your project
// };



const SignupForm = () => {
    // --- State and Hooks (Functionality Preserved) ---
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        companyName: '',
        country: '',
    });
    
    // Using the mock/real useAuthStore hook
    const { signup, loading, error: authError } = useAuthStore(); 
    const navigate = useNavigate();

    // Local state to manage the error message displayed in the UI
    const [displayError, setDisplayError] = useState(authError);
    // Sync the external error state for display
    useState(() => {
        setDisplayError(authError);
    }, [authError]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setDisplayError(null); // Clear previous error
        
        // --- Core Signup Logic (Functionality Preserved) ---
        const result = await signup(formData);
        
        if (result.success) {
            navigate('/dashboard'); // Navigation preserved
        } else if (result.error) {
            // Update display error if signup failed
            setDisplayError(result.error); 
        }
    };
    // ----------------------------------------------------

    // Helper component for input fields
    const InputField = ({ name, type, placeholder, icon: Icon, required = false }) => (
        <div className="form-control mb-4">
            <label className="label">
                <span className="label-text font-semibold text-gray-600 capitalize">
                    {name.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {required && <span className="label-text-alt text-error">* Required</span>}
            </label>
            <div className="input-group">
                
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    className="input input-bordered w-full focus:ring-2 focus:ring-secondary focus:border-secondary transition duration-150"
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    disabled={loading}
                />
            </div>
        </div>
    );

    return (
        // Full screen container for centering and background aesthetics
        // Increased vertical padding to ensure space for the card
        <div className="min-h-screen flex items-center justify-center bg-base-100 py-8 px-4 font-inter">
            
            {/* Signup Card (DaisyUI component) - Applied max-h-screen and overflow-y-auto for scrolling */}
            <div className="card w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100/50 
                          max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="card-body p-8 sm:p-12">
                    
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <Sparkles className="w-12 h-12 text-secondary mb-3 animate-pulse" />
                        <h2 className="card-title text-3xl font-extrabold text-gray-800">
                            Create Admin & Company
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Set up your Expense Management portal in one step.
                        </p>
                    </div>

                    {/* Error Display */}
                    {displayError && (
                        <div role="alert" className="alert alert-error mb-6 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            <span>{displayError}</span>
                        </div>
                    )}

                    {/* Form Fields Grid - Responsive Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6">
                        {/* Column 1: Personal/Login Details */}
                        <div>
                            <h3 className="text-lg font-bold text-secondary mb-4 border-b pb-2">Admin Details</h3>
                            <InputField 
                                name="firstName" 
                                type="text" 
                                placeholder="Your first name" 
                                icon={User} 
                                required 
                            />
                            <InputField 
                                name="lastName" 
                                type="text" 
                                placeholder="Your last name" 
                                icon={User} 
                                required 
                            />
                            <InputField 
                                name="email" 
                                type="email" 
                                placeholder="name@example.com" 
                                icon={Mail} 
                                required 
                            />
                            <InputField 
                                name="password" 
                                type="password" 
                                placeholder="Secure password" 
                                icon={Lock} 
                                required 
                            />
                        </div>

                        {/* Column 2: Company Details */}
                        <div>
                            <h3 className="text-lg font-bold text-secondary mb-4 border-b pb-2">Company Setup</h3>
                            <InputField 
                                name="companyName" 
                                type="text" 
                                placeholder="Your organization's name" 
                                icon={Briefcase} 
                                required 
                            />
                            {/* NOTE: In a production app, 'country' would be a select dropdown 
                                with options fetched from the restcountries API for currency setup */}
                            <InputField 
                                name="country" 
                                type="text" 
                                placeholder="e.g., India or United States" 
                                icon={Globe} 
                                required 
                            />
                        </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="form-control mt-8">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`btn btn-secondary w-full rounded-lg text-white font-bold tracking-wide transition duration-300 transform hover:scale-[1.01] ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-secondary-focus'}`}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Sign Up and Launch Portal
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer Links (Example) */}
                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-500">
                            Already have an account? 
                            <a href="/login" className="link link-hover text-secondary hover:text-secondary-focus ml-1 font-medium">
                                Log In
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupForm;
