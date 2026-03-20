import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6"; 

const Input = ({ type, placeholder, className, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        placeholder={placeholder}
        className={`w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-0 outline-none transition-all placeholder:text-gray-400 text-sm ${className}`}
        {...rest}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 cursor-pointer"
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      )}
    </div>
  );
};

export default Input;