import React, { useState } from 'react'
import { HiOutlineHeart, HiOutlineShoppingCart, HiBell, HiUser, HiOutlineSearch } from 'react-icons/hi'

const Header = () =>{
    const [langOpen, setLangOpen] = useState(false)
    const [currentLang, setCurrentLang] = useState('/src/assets/English-flag.svg')

    const toggleLanguage = () => {
        setLangOpen(!langOpen)
    }

    const changeLang = (lang) => {
        setCurrentLang(lang)
        setLangOpen(false)
    }
    return(
        <div className="w-full h-22 bg-gray-800 text-white flex items-center justify-between px-10">
            <div className="">
                <img src="../public/UIT-Share-Logo-2.svg" alt="Logo" className="h-15 w-15 object-contain flex items-center justify-center mt-2.5 flex-shrink-0" />
            </div>

            <div className="flex-1 mx-6 max-w-2xl">
                <div className="flex items-center bg-gray-700 rounded-full px-4 py-1.5">
                    <input
                        type="text"
                        placeholder="What do you want to learn?"
                        className="flex-1 bg-transparent placeholder-gray-400 focus:outline-none"
                    />
                    <button className="ml-3 bg-black hover:bg-red-600 w-10 h-10 rounded-full flex items-center justify-center">
                        <HiOutlineSearch size={18} className="text-white" />
                    </button>
                </div>
            </div>

            <nav className="hidden lg:flex items-center gap-2 pr-7">
                <a href="#" className=" text-sm font-semibold hover:text-gray-200 px-3">Đại cương</a>
                <a href="#" className=" text-sm font-semibold hover:text-gray-200 px-3">Cơ sở ngành</a>
                <a href="#" className=" text-sm font-semibold hover:text-gray-200 px-3">Chuyên ngành</a>
            </nav>

            <div className="flex items-center gap-7 flex-shrink-0">
                <div className="relative flex items-center">
                    <button 
                        onClick={toggleLanguage}
                        className="inline-flex items-center gap-1 border-none bg-transparent cursor-pointer transition hover:opacity-80"
                    >
                        <img src={currentLang} alt="flag" className="w-8 h-5 object-contain" />
                        <span className={`text-xs transition-transform ${langOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>
                    
                    {langOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-gray-700 rounded shadow-lg z-[100] p-2 min-w-max">
                            <button 
                                onClick={() => changeLang('/src/assets/English-flag.svg')}
                                className="block w-full text-left px-2 py-2 hover:bg-gray-600 rounded"
                            >
                                <img src="/src/assets/English-flag.svg" alt="English" className="w-10 h-5 object-contain" />
                            </button>
                            <button 
                                onClick={() => changeLang('/src/assets/Flag_of_Vietnam.svg')}
                                className="block w-full text-left px-2 py-2 hover:bg-gray-600 rounded border-t border-gray-600 mt-1"
                            >
                                <img src="/src/assets/Flag_of_Vietnam.svg" alt="Vietnam" className="w-10 h-5 object-contain" />
                            </button>
                        </div>
                    )}
                </div>

                <button className="hover:opacity-80 transition">
                    <HiOutlineShoppingCart size={24} />
                </button>

                <button className="hover:opacity-80 transition relative">
                    <HiBell size={24} />
                </button>

                <button className="hover:opacity-80 transition">
                    <HiUser size={24} />
                </button>
            </div>
        </div>
    )

}

export default Header;