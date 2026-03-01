import React from 'react';
import { FaTelegram, FaDiscord, FaXTwitter, FaFacebookF, FaTiktok, FaYoutube, FaThreads, FaInstagram } from 'react-icons/fa6';
export default function Footer() {
  return <footer className="bg-[#0b0f19] text-gray-300 py-10 px-6 md:px-12 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl ml-0 mr-auto">
        {/* Top section: Logo and Socials */}
        <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <img src="../public/UIT-Share-Logo-2.svg" alt="UITShare Logo" className="h-20 object-contain" />
            <div className="h-10 w-px bg-gray-700 hidden md:block"></div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <a href="#" className="w-10 h-10 rounded-full bg-[#1c1e2f] flex items-center justify-center hover:bg-gray-600 transition-colors text-white">
              <FaTelegram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#1c1e2f] flex items-center justify-center hover:bg-gray-600 transition-colors text-white">
              <FaDiscord size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#1c1e2f] flex items-center justify-center hover:bg-gray-600 transition-colors text-white">
              <FaXTwitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#1c1e2f] flex items-center justify-center hover:bg-gray-600 transition-colors text-white">
              <FaFacebookF size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#1c1e2f] flex items-center justify-center hover:bg-gray-600 transition-colors text-white">
              <FaTiktok size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#1c1e2f] flex items-center justify-center hover:bg-gray-600 transition-colors text-white">
              <FaYoutube size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#1c1e2f] flex items-center justify-center hover:bg-gray-600 transition-colors text-white">
              <FaThreads size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#1c1e2f] flex items-center justify-center hover:bg-gray-600 transition-colors text-white">
              <FaInstagram size={18} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-6 mb-6 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">Hỏi-Đáp</a>
          <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
          <a href="#" className="hover:text-white transition-colors">Giới thiệu</a>
          <a href="#" className="hover:text-white transition-colors">Liên hệ</a>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-5xl">
          UITShare – Nền tảng chia sẻ và mua bán tài liệu học tập dành riêng cho sinh viên Trường Đại học Công nghệ Thông tin (UIT). UITShare giúp sinh viên dễ dàng trao đổi tài liệu các môn học như lập trình, cơ sở dữ liệu, mạng máy tính, trí tuệ nhân tạo, hệ thống thông tin, toán học và nhiều học phần chuyên ngành khác.
        </p>

        {/* Copyright */}
        <p className="text-gray-500 text-sm">
          © 2026 UITShare
        </p>
      </div>
    </footer>;
}