// components/Navigation.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');  // 'null' 문자열로 변경

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-800 hover:text-gray-600">Home</Link>
            <Link to="/users" className="text-gray-800 hover:text-gray-600">Users</Link>
            <Link to="/chat" className="text-gray-800 hover:text-gray-600">Chat</Link>
          </div>
          {user && (  // user가 있을 때만 표시
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;