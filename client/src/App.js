// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Chat from './components/Chat';
import Login from './components/Login';
import UserList from './components/UserList';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated() && <Navigation />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={isAuthenticated() ? <Home /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/chat" 
            element={isAuthenticated() ? <Chat /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/users" 
            element={isAuthenticated() ? <UserList /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;