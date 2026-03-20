const AuthButton = ({ children, ...rest }) => (
    <button 
        className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20 cursor-pointer"
        {...rest}
    >
        {children}
    </button>
)

export default AuthButton