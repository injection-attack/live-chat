import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')  // '/api' 접두사 추가
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="grid gap-4">
        {users.map((user, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            {/* <p className="text-gray-600">{user.email}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;