import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AlertIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4.5M12 16h.01" />
  </svg>
);

const CheckIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordValid = password.length >= 8;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateClientSide = () => {
    const next = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!emailRegex.test(email.trim())) next.email = 'Please enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    return next;
  };

  // FastAPI sends errors in two different shapes:
  // - App-level errors (duplicate email, weak password): detail is a plain string.
  // - Pydantic validation errors (bad email format, missing field): detail is an
  //   array of {type, loc, msg, ...} objects. This normalizes both into one string.
  const extractErrorMessage = (error) => {
    const detail = error.response?.data?.detail;
    if (!detail) return error.message || 'Registration failed. Please try again.';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).filter(Boolean).join(', ') || 'Registration failed. Please try again.';
    }
    return 'Registration failed. Please try again.';
  };

  // Maps whatever the backend says (in `detail`) to the field it's about,
  // so the error shows up next to the right input instead of just a toast.
  const applyServerError = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('email')) {
      setErrors({ email: message });
    } else if (lower.includes('password')) {
      setErrors({ password: message });
    } else {
      setErrors({ form: message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = validateClientSide();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await register(email, password, fullName);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      // FastAPI sends the real reason in error.response.data.detail — but its
      // shape varies (string vs. validation-error array), hence the helper above.
      const detail = extractErrorMessage(error);
      toast.error(detail);
      applyServerError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121218] px-4 transition-colors">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-[#1C1B24] border border-transparent dark:border-[#33313D] rounded-xl shadow-lg transition-colors">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-[#EDEBF3]">
            Create Account
          </h2>
        </div>

        {errors.form && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-[#FBEAE9] border border-[#F5C6C3] text-[#B3261E] text-sm dark:bg-[#2A1D1D] dark:border-[#4A2E2C] dark:text-[#F2938C]">
            <AlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#A6A4B0]">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              className={`mt-1 block w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#121218] text-gray-900 dark:text-[#EDEBF3] placeholder-gray-400 dark:placeholder-[#75727F] focus:outline-none focus:ring-2 transition-colors
                ${errors.fullName
                  ? 'border-[#DC2626] focus:ring-[#DC2626]/30 dark:border-[#E0665F]'
                  : 'border-gray-300 dark:border-[#3D3A48] focus:ring-blue-500 dark:focus:ring-[#6D5EF0]/30 dark:focus:border-[#6D5EF0]'
                }`}
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-[#DC2626] dark:text-[#E0665F]">
                <AlertIcon className="h-3.5 w-3.5" />
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#A6A4B0]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`mt-1 block w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#121218] text-gray-900 dark:text-[#EDEBF3] placeholder-gray-400 dark:placeholder-[#75727F] focus:outline-none focus:ring-2 transition-colors
                ${errors.email
                  ? 'border-[#DC2626] focus:ring-[#DC2626]/30 dark:border-[#E0665F]'
                  : 'border-gray-300 dark:border-[#3D3A48] focus:ring-blue-500 dark:focus:ring-[#6D5EF0]/30 dark:focus:border-[#6D5EF0]'
                }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-[#DC2626] dark:text-[#E0665F]">
                <AlertIcon className="h-3.5 w-3.5" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#A6A4B0]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className={`mt-1 block w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#121218] text-gray-900 dark:text-[#EDEBF3] placeholder-gray-400 dark:placeholder-[#75727F] focus:outline-none focus:ring-2 transition-colors
                ${errors.password
                  ? 'border-[#DC2626] focus:ring-[#DC2626]/30 dark:border-[#E0665F]'
                  : 'border-gray-300 dark:border-[#3D3A48] focus:ring-blue-500 dark:focus:ring-[#6D5EF0]/30 dark:focus:border-[#6D5EF0]'
                }`}
              placeholder="Min 8 characters"
            />
            {errors.password ? (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-[#DC2626] dark:text-[#E0665F]">
                <AlertIcon className="h-3.5 w-3.5" />
                {errors.password}
              </p>
            ) : (
              password.length > 0 && (
                <p className={`flex items-center gap-1 mt-1.5 text-xs ${passwordValid ? 'text-[#1E7A34] dark:text-[#7FD99A]' : 'text-gray-400 dark:text-[#75727F]'}`}>
                  {passwordValid && <CheckIcon className="h-3.5 w-3.5" />}
                  {passwordValid ? '8+ characters — looks good' : `${8 - password.length} more character${8 - password.length === 1 ? '' : 's'} needed`}
                </p>
              )
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition dark:bg-[#6D5EF0] dark:hover:bg-[#7C6EF5]"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-[#A6A4B0]">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-[#A79CF5] hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
