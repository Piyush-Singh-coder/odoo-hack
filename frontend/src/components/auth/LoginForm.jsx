import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// NOTE: Assuming useAuthStore is defined elsewhere and is available in the environment
// We keep the original imports for functionality preservation.
// import { useAuthStore } from '../../stores'; 

// Import Lucide React icons for a professional look
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores';

// Mock the external dependencies to make this file runnable in an isolated environment
// In a real project, you would delete this mock code:
// =========================================================================

// const useNavigate = () => (path) => {
//     console.log(`Navigating to: ${path}`);
//     // You'd replace this with the actual navigation logic in your project
// };
// =========================================================================


const LoginForm = () => {
    // --- State and Hooks (Functionality Preserved) ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Using the mock/real useAuthStore hook
    const { login, loading, error } = useAuthStore(); 
    const navigate = useNavigate();

    // Local state to manage the error message displayed in the UI
    const [displayError, setDisplayError] = useState(error);
    // Sync the external error state for display
    useState(() => {
        setDisplayError(error);
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setDisplayError(null); // Clear previous error
        
        // --- Core Login Logic (Functionality Preserved) ---
        // Note: The structure of login and result is assumed from the original code
        const result = await login(email, password);
        
        if (result.success) {
            navigate('/dashboard'); // Navigation preserved
        } else if (result.error) {
            // Update display error if login failed
            setDisplayError(result.error); 
        }
    };
    // ----------------------------------------------------


    return (
        // Full screen container for centering and background aesthetics
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4 font-inter">
            
            {/* Login Card (DaisyUI component) */}
            <div className="card w-full max-w-md bg-white shadow-2xl rounded-xl border border-gray-100/50">
                <form onSubmit={handleSubmit} className="card-body p-8 sm:p-10">
                    
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <LogIn className="w-10 h-10 text-primary mb-3" />
                        <h2 className="card-title text-3xl font-extrabold text-gray-800">
                            Expense Tracker Login
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">Access your management portal.</p>
                    </div>

                    {/* Error Display */}
                    {displayError && (
                        <div role="alert" className="alert alert-error mb-6 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            <span>{displayError}</span>
                        </div>
                    )}

                    {/* Email Input Field */}
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text font-semibold text-gray-600">Email Address</span>
                        </label>
                        <div className="input-group">
                            
                            <input
                                type="email"
                                placeholder="e.g., john.doe@company.com"
                                className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-primary transition duration-150"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password Input Field */}
                    <div className="form-control mb-6">
                        <label className="label">
                            <span className="label-text font-semibold text-gray-600">Password</span>
                        </label>
                        <div className="input-group">
                            
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-primary transition duration-150"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="form-control">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`btn btn-primary w-full rounded-lg text-white font-bold tracking-wide transition duration-300 transform hover:scale-[1.01] ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-focus'}`}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </div>

                    {/* Footer Links (Example) */}
                    <div className="mt-6 text-center text-sm">
                        <a href="#" className="link link-hover text-primary hover:text-primary-focus">
                            Forgot Password?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;