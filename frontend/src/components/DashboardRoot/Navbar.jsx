import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '/images/logo.jpeg';
import { IoNotifications, IoPerson } from 'react-icons/io5';
import Hamburger from 'hamburger-react';

const Navbar = ({ userData, sidebarIsVisible, setSidebarIsVisible }) => {
  const handleLogout = async () => {
    let res = await fetch(`${import.meta.env.VITE_APP_API_URL}/logout`, {
      method: 'GET',
      credentials: 'include',
    });

    return res;
  }

  const userDesignation = userData.designation;
  const userName = userData.userName;

  const [profileData] = useState({
    name: userName,
    university: "Somaiya Vidyavihar University",
    role: userDesignation,
  });

  // Navbar Links for Role should be different
  const links = [
    { label: "Dashboard", path: "dashboard" },
  ];

  return (
    <>
      <header>
        <nav className="bg-white shadow-md border-b-4 border-gray-200 w-full">
          <div className="w-full flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-6 justify-start">
              <Link to="/" className="hidden md:flex items-center">
                <img src={logo} alt="Somaiya" className="object-contain w-48" />
              </Link>
              {/* Hamburger Menu for Mobile */}
              <div className='md:hidden'>
                <Hamburger toggled={sidebarIsVisible} toggle={setSidebarIsVisible} />
              </div>
            </div>

            <div className="flex items-center space-x-4 text-lg font-medium">
              {/* Navbar Links */}
              <div className="hidden sm:flex items-center space-x-2">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Link
                      to={link.path}
                      className="text-gray-700 hover:bg-red-700 hover:text-white px-4 py-2 rounded-md transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                    <span>|</span>
                  </div>
                ))}
              </div>

              {/* Logout Button */}
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/"
                  onClick={handleLogout}
                  className="text-gray-700 hover:bg-red-700 hover:text-white px-4 py-2 rounded-md transition-all duration-200"
                >
                  Logout
                </Link>
                <span>|</span>
              </div>

              {/* User Profile */}
              {profileData.name && profileData.role && (
                <div className="flex items-center space-x-2 bg-red-100 p-2 rounded-md">
                  <IoPerson className="text-red-700 text-xl" />
                  <div className="hidden sm:block">
                    <div className="text-gray-700 font-semibold">{profileData.name}</div>
                    <div className="text-xs text-gray-500">{profileData.role}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
