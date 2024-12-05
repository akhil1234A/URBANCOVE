import './css/User.css'; 

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, toggleUserBlockStatus } from '../../slices/admin/userSlice';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error, currentPage, totalPages } = useSelector((state) => state.users);

  // useEffect(() => {
  //   console.log('Users state:', users); 
  // }, [users]);
  

  useEffect(() => {
    dispatch(getUsers({ page: currentPage }));
  }, [dispatch, currentPage]);


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(getUsers({ page }));
    }
  };


  const handleToggleBlockStatus = (userId) => {
    dispatch(toggleUserBlockStatus(userId));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Users</h1>
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
    <div className="pagination flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`py-2 px-4 bg-gray-200 rounded-lg ${
            currentPage === 1 ? 'cursor-not-allowed text-gray-400' : 'hover:bg-gray-300'
          } transition duration-300`}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`py-2 px-4 rounded-lg ${
              currentPage === index + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition duration-300`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`py-2 px-4 bg-gray-200 rounded-lg ${
            currentPage === totalPages ? 'cursor-not-allowed text-gray-400' : 'hover:bg-gray-300'
          } transition duration-300`}
        >
          Next
        </button>
      </div>
  </div>
);
};

export default Users;
