import React, { useEffect, useState } from 'react';
import './Admin.css'; // Make sure to include your CSS for any additional styling

const Users = () => {
  // Dummy user data
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", blocked: false },
    { id: 2, name: "Jane Smith", email: "jane@example.com", blocked: true },
    { id: 3, name: "Alice Johnson", email: "alice@example.com", blocked: false },
    { id: 4, name: "Bob Brown", email: "bob@example.com", blocked: true },
  ]);

  const toggleBlockStatus = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, blocked: !user.blocked } : user
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Users</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">
                {user.blocked ? 'Blocked' : 'Unblocked'}
              </td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => toggleBlockStatus(user.id)}
                  className={`py-1 px-2 rounded-md text-white 
                    ${user.blocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} transition duration-200`}
                >
                  {user.blocked ? 'Unblock' : 'Block'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
