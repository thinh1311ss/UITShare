import { Link } from "react-router";
import loginImg from "../../assets/login-img.jpg" 
import Input from "../../components/UI/Input";
import AuthButton from "../../components/Auth/AuthButton";
import { useState } from "react";

const ForgotPassword = () => {
    
    const [email, setEmail] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

        if(!email) {
            alert('Chưa nhập email!')
            return
        }

        setEmail('')
    }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen bg-white">

        <div className="hidden md:block p-2">
            <div className="h-full w-full rounded-2xl overflow-hidden relative">
                <img 
                    src={loginImg}
                    alt="Forgot Password Banner"
                    className="h-full w-full object-cover object-right"
                />
                
                <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-linear-to-t from-black/90 via-black/50 to-transparent"></div>

                <div className="absolute bottom-10 left-6 right-6 text-white z-10">
                    <h3 className="text-3xl font-bold mb-2 drop-shadow-md">UITShare</h3>
                    <p className="text-gray-200 text-sm leading-relaxed drop-shadow-sm">
                        Khôi phục quyền truy cập vào kho tri thức của bạn.
                        <br />An toàn, bảo mật và nhanh chóng.
                    </p>
                </div>
            </div>
        </div>

        <div className="flex flex-col justify-center items-center p-6 md:p-12">
            
            <div className="w-full max-w-100"> 

                <div className="mb-8">
                    <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                        Quay lại đăng nhập
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
                    <p className="text-gray-500 text-sm">
                        Đừng lo lắng! Hãy nhập email sinh viên của bạn bên dưới, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ email</label>
                        <Input 
                            type="email" 
                            name="email"
                            required
                            placeholder="mssv@gm.uit.edu.vn"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <AuthButton>Gửi yêu cầu</AuthButton>
                </form>

                <div className="mt-12 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        Bạn gặp khó khăn khi nhận mã? <br />
                        Gửi mail hỗ trợ tại: <a href="mailto:23521799@gm.uit.edu.vn" className="font-semibold text-gray-700 underline cursor-pointer">support@uitshare.com</a>
                    </p>
                </div>
            </div>
        </div>

    </div>
  );
};

export default ForgotPassword;