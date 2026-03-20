const AuthButton = ({ icon, text }) => (
    <button className="flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700 text-sm cursor-pointer" type="button">
        <img src={icon} className="w-5 h-5" alt="" />
        {text}
    </button>
)

export default AuthButton