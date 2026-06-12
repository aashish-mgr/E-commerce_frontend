import { useState,useEffect } from "react";
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from "react-router-dom";
import { LogoutUser } from "../store/authSlice";
import {getUserProfile} from "../store/authSlice";

const NAV_LINKS = ["Home", "Products", "Categories", "About"];

// Props:
//   onLogin    () => void
//   onRegister () => void
export default function Navbar({ onLogin, onRegister, user,
  cartCount,
  onCartClick,
  onOrderHistoryClick,
  onProfileClick, }:any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const authState = useSelector( (state: any) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const navigate = useNavigate();
  const handleLogout = async () => {
    await dispatch(LogoutUser() as any);
    
    navigate('/',{replace: true});
  }

 useEffect(() => {
   if(!authState.isAuthenticated) return;
    dispatch(getUserProfile() as any);
 }, [])
 
   


  return (
    <nav className="border-b border-gray-200 sticky top-0 bg-white z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <span className="text-xl font-bold tracking-tight">ShopEase</span>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="hover:text-gray-900 transition-colors">
              {link}
            </a>
          ))}
        </div>

        {/* Desktop auth buttons */}
        

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          )}
        </button>
      

      {authState.isAuthenticated ? (
        <>
        {/* User avatar + dropdown */}
        
          <div className="relative ml-1 flex">
            <button
            onClick={onOrderHistoryClick}
            className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            Orders
          </button>

          {/* Cart */}
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 pl-2 pr-3 py-1.5 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                aj
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.userName}</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-13 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm">
                <button
                  onClick={() => { onProfileClick(); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  My Profile
                </button>
                <button
                  onClick={() => { onOrderHistoryClick(); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors sm:hidden"
                >
                  Order History
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick= {handleLogout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors" >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </>
      ): (<>
      <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
          >
            Login
          </button>
          <button
            onClick={onRegister}
            className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Register
          </button>
        </div>
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-3 text-sm text-gray-600 bg-white">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="hover:text-gray-900 transition-colors">
              {link}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { onLogin(); setMenuOpen(false); }}
              className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => { onRegister(); setMenuOpen(false); }}
              className="flex-1 bg-gray-900 text-white rounded-lg py-2 hover:bg-gray-700 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      )}
      </>) }
      </div>
    </nav>
  );
}