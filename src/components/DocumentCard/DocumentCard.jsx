import React from 'react'
import pic2 from '../../assets/pic2.jpg'
import logouit from '../../assets/logouit.png'

const DocumentCard = () => {
  return (
    <div className='pt-4 pl-4'>
      <div className='bg-white rounded-lg shadow-md overflow-hidden w-64 border-2 border-gray-400 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer'>
        <div className='relative h-32 bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center'>
          <img src={pic2} alt="course" className='w-full h-full object-cover' />
          <div className='absolute top-2 right-2 bg-white px-2 py-0.5 rounded-full text-xs font-medium border-2 border-gray-400'>
            Preview
          </div>
        </div>
      <div className='p-4'>
        <div className='flex items-center gap-2 mb-2'>
          <div className='border border-gray-300 w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-lg'>
            <img src={logouit} alt="logouit" className='w-5 h-5 object-contain' />
          </div>
          <span className='text-xs text-gray-600'>Trường đại học Công nghệ Thông tin - ĐHQG TP.HCM</span>
        </div>
        <h2 className='text-sm font-bold text-gray-900 mb-2 line-clamp-2'>Ôn tập cuối kì Hệ Điều Hành</h2>
        <div className='mb-3'>
          <p className='text-xs text-gray-600 line-clamp-2'>
            <span className='font-semibold'>Nội dung:</span> Câu hỏi trắc nghiệm,bài tập tự luận
          </p>
        </div>
        <div className='flex items-center gap-2 mb-2'>
          <div className='flex items-center gap-0.5'>
            <span className='text-lg'>★</span>
            <span className='font-semibold text-gray-900 text-sm'>4.8</span>
          </div>
          <span className='text-xs text-gray-600'>17K reviews</span>
        </div>
        <p className='text-xs text-gray-600'>10 trang · 2024/2025</p>
      </div>
      </div>
    </div>
  )
}

export default DocumentCard