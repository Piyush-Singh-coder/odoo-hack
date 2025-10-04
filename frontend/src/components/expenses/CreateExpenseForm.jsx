import React, { useState, useEffect } from 'react';
// NOTE: Assuming useExpenseStore and useApprovalStore are defined elsewhere and are available.
// import { useExpenseStore, useApprovalStore } from '../../stores';

// Import Lucide React icons
import { 
    DollarSign, Calendar, FileText, CheckCircle, Upload, Scan, 
    Layers, AlertCircle, TrendingUp, X, Check, Clock 
} from 'lucide-react';

// --- MOCK DEPENDENCIES (for isolated running) ---
const useExpenseStore = () => {
    const [ocrData, setOcrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createExpense = async (formData) => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        console.log("Expense Submitted:", formData);
        return { success: true };
    };

    const scanReceipt = async (file) => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        if (file && file.name.includes('fail')) {
             setError("OCR failed to process the receipt.");
             return { success: false };
        }
        // Simulate OCR extraction
        setOcrData({ 
            amount: '75.50', 
            description: 'Lunch meeting with client X', 
            date: '2025-10-03' 
        });
        return { success: true };
    };

    const clearOcrData = () => setOcrData(null);

    return { createExpense, scanReceipt, ocrData, clearOcrData, loading, error };
};

const useApprovalStore = () => {
    const approvalRules = [
        { id: '1', rule_name: 'High Value', rule_type: 'Director' },
        { id: '2', rule_name: 'Standard', rule_type: 'Manager' },
        { id: '3', rule_name: 'IT Purchases', rule_type: 'Finance + IT' },
    ];
    const fetchApprovalRules = () => console.log("Fetched approval rules.");
    return { approvalRules, fetchApprovalRules };
};

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


const CreateExpenseForm = ({ onSuccess }) => {
    // State to handle form data, notification, and loading (functionality preserved)
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        category: '',
        description: '',
        expenseDate: '',
        approvalRuleId: '',
        receipt: null,
    });
    const [notification, setNotification] = useState(null);


    const { 
        createExpense, scanReceipt, ocrData, clearOcrData, 
        loading: storeLoading, error: storeError 
    } = useExpenseStore();
    const { approvalRules, fetchApprovalRules } = useApprovalStore();
    
    // Combine loading states
    const isLoading = storeLoading;
    const error = storeError;

    // Fetch approval rules (functionality preserved)
    useEffect(() => {
        // Only call fetchApprovalRules if it's available (not mocked out with console.log)
        if (fetchApprovalRules) {
            fetchApprovalRules();
        }
    }, [fetchApprovalRules]);

    // Auto-fill form when OCR data is available (functionality preserved)
    useEffect(() => {
        if (ocrData) {
            setFormData(prev => ({
                ...prev,
                amount: ocrData.amount || prev.amount,
                description: ocrData.description || prev.description,
                expenseDate: ocrData.date || prev.expenseDate,
            }));
        }
    }, [ocrData]);
    
    // Display error notification if one occurs
    useEffect(() => {
        if (error) {
            setNotification({ message: error, type: 'error' });
        }
    }, [error]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            receipt: file,
        });
    };

    const handleScanReceipt = async () => {
        if (!formData.receipt) {
            // Replaced alert with DaisyUI notification
            setNotification({ message: 'Please select a receipt image first.', type: 'error' });
            return;
        }
        
        // Ensure to clear old OCR data before new scan
        clearOcrData();

        const result = await scanReceipt(formData.receipt);
        if (result.success) {
            // Replaced alert with DaisyUI notification
            setNotification({ message: 'Receipt scanned successfully! Form fields have been auto-filled.', type: 'success' });
        }
        // Note: Errors during scan are handled by the useEffect watching storeError
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const result = await createExpense(formData);
        if (result.success) {
            // Replaced alert with DaisyUI notification
            setNotification({ message: 'Expense created successfully.', type: 'success' });
            
            // Clear form (functionality preserved)
            setFormData({
                amount: '',
                currency: 'USD',
                category: '',
                description: '',
                expenseDate: '',
                approvalRuleId: '',
                receipt: null,
            });
            clearOcrData();
            if (onSuccess) onSuccess();
        }
        // Note: Errors during submit are handled by the useEffect watching storeError
    };

    // Helper component for styled input
    const InputField = ({ name, type = 'text', placeholder, icon: Icon, required = false, isSelect = false, options = [], children }) => {
        const isDate = type === 'date';
        const isTextarea = type === 'textarea';

        const InputComponent = isSelect ? 'select' : (isTextarea ? 'textarea' : 'input');
        const inputClasses = isTextarea 
            ? "textarea textarea-bordered w-full focus:ring-2 focus:ring-accent"
            : (isSelect ? "select select-bordered w-full focus:ring-2 focus:ring-accent" : "input input-bordered w-full focus:ring-2 focus:ring-accent");
        
        // Correctly handle props for different components
        const props = {
            name,
            placeholder,
            className: `${inputClasses} ${isDate ? 'text-gray-500' : ''}`,
            onChange: handleChange,
            required,
            disabled: isLoading,
            step: type === 'number' ? '0.01' : undefined,
            rows: isTextarea ? '3' : undefined,
            value: formData[name] // Use value prop directly
        };

        if (!isSelect && !isTextarea) {
             props.type = isDate ? 'date' : type;
        }
        
        // The fix is here: we only render the children/options if it's a select/textarea
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
                <div className="input-group">
                    {!isSelect && Icon && (
                        <span className="bg-gray-100 text-gray-500 p-3">
                            <Icon className="w-5 h-5" />
                        </span>
                    )}
                    <InputComponent
                        {...props}
                    >
                        {componentChildren}
                    </InputComponent>
                </div>
            </div>
        );
    };


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
            
            {/* Expense Card */}
            <div className="card w-full max-w-3xl bg-white shadow-xl rounded-xl border border-gray-200 mt-10 mb-10">
                <form onSubmit={handleSubmit} className="card-body p-8 sm:p-10">
                    
                    {/* Header */}
                    <div className="flex items-center mb-8 border-b pb-4">
                        <DollarSign className="w-8 h-8 text-success mr-3" />
                        <h2 className="card-title text-2xl font-extrabold text-gray-800">
                            Submit New Expense Claim
                        </h2>
                    </div>

                    {/* Receipt/OCR Section */}
                    <div className="border border-dashed border-gray-300 p-6 rounded-lg mb-6 bg-base-100">
                        <h3 className="text-lg font-bold text-success flex items-center mb-4">
                            <Scan className="w-5 h-5 mr-2" /> OCR Receipt Scanning (Optional)
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            
                            {/* File Input */}
                            <div className="flex-1 w-full">
                                <label className="form-control w-full">
                                    <span className="label-text mb-2">Select Receipt Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="file-input file-input-bordered file-input-success w-full"
                                        disabled={isLoading}
                                    />
                                </label>
                            </div>

                            {/* Scan Button */}
                            {formData.receipt && (
                                <button 
                                    type="button" 
                                    onClick={handleScanReceipt} 
                                    disabled={isLoading}
                                    className="btn btn-success text-white w-full sm:w-auto h-12 mt-4 sm:mt-6"
                                >
                                    {isLoading && formData.receipt && ocrData === null ? (
                                        <>
                                            <span className="loading loading-spinner"></span>
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Scan Receipt
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {ocrData && (
                            <p className="text-sm text-success mt-3 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" /> OCR data applied to form fields.
                            </p>
                        )}
                    </div>

                    {/* Main Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        
                        {/* Amount & Currency */}
                        <InputField 
                            name="amount" 
                            type="number" 
                            placeholder="0.00" 
                            
                            required 
                        />
                        <InputField 
                            name="currency" 
                            isSelect
                            required
                            options={[
                                { value: 'USD', label: 'USD - US Dollar' },
                                { value: 'EUR', label: 'EUR - Euro' },
                                { value: 'GBP', label: 'GBP - British Pound' },
                                { value: 'INR', label: 'INR - Indian Rupee' },
                                { value: 'JPY', label: 'JPY - Japanese Yen' },
                            ]}
                        />

                        {/* Category & Date */}
                        <InputField 
                            name="category" 
                            placeholder="e.g., Travel, Food, Software" 
                            
                            required 
                        />
                        <InputField 
                            name="expenseDate" 
                            type="date" 
                            
                            required 
                        />
                    </div>
                    
                    {/* Description (Full Width) */}
                    <div className="col-span-full">
                        <InputField 
                            name="description" 
                            type="textarea" 
                            placeholder="Detailed purpose of the expense..." 
                           
                        />
                    </div>

                    {/* Approval Rule (Full Width) */}
                    <div className="col-span-full">
                        <InputField 
                            name="approvalRuleId" 
                            isSelect
                            required
                            
                        >
                            <option value="" disabled={formData.approvalRuleId !== ''}>
                                Select Approval Rule (Required)
                            </option>
                            {approvalRules.map((rule) => (
                                <option key={rule.id} value={rule.id}>
                                    {rule.rule_name} ({rule.rule_type})
                                </option>
                            ))}
                        </InputField>
                    </div>

                    {/* Submit Button */}
                    <div className="form-control mt-8">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`btn btn-primary w-full rounded-lg text-white font-bold text-lg 
                                transition duration-300 transform hover:scale-[1.01] ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-focus'}`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Submitting Claim...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-6 h-6 mr-2" />
                                    Submit Expense for Approval
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateExpenseForm;
