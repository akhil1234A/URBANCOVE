import './css/User.css'; 

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, toggleUserBlockStatus } from '../../slices/admin/userSlice';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  // useEffect(() => {
  //   console.log('Users state:', users); 
  // }, [users]);
  

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleToggleBlockStatus = (userId) => {
    dispatch(toggleUserBlockStatus(userId));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
    <h1 className="text-2xl mb-4">Users</h1>
    <table className="min-w-full bg-white border border-gray-300">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b text-center">Name</th>
          <th className="py-2 px-4 border-b text-center">Email</th>
          <th className="py-2 px-4 border-b text-center">Status</th>
          <th className="py-2 px-4 border-b text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td className="py-2 px-4 border-b text-center">{user.name}</td>
            <td className="py-2 px-4 border-b text-center">{user.email}</td>
            <td className="py-2 px-4 border-b text-center">
              {user.isActive ? 'Active' : 'Blocked'}
            </td>
            <td className="py-2 px-4 border-b text-center">
              <button
                onClick={() => handleToggleBlockStatus(user._id)}
                className={`py-1 px-2 rounded-md text-white 
                  ${user.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} transition duration-200`}
              >
                {user.isActive ? 'Block' : 'UnBlock'}
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
