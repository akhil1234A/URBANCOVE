import './css/User.css';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactModal from 'react-modal'; // Import React-Modal
import { getUsers, toggleUserBlockStatus } from '../../slices/admin/userSlice';
import { ClipLoader } from 'react-spinners';

// Style the modal using custom CSS or inline styles
const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error, currentPage, totalPages } = useSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(getUsers({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(getUsers({ page }));
    }
  };

  const openConfirmationModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const confirmToggleBlockStatus = () => {
    if (selectedUser) {
      dispatch(toggleUserBlockStatus(selectedUser._id));
      closeConfirmationModal();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
    <ClipLoader color="#36D7B7" size={50} /> {/* Spinner */}
  </div>
    )
  }
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
                  onClick={() => openConfirmationModal(user)}
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

      {/* Confirmation Modal */}
      {selectedUser && (
        <ReactModal
          isOpen={isModalOpen}
          onRequestClose={closeConfirmationModal}
          style={modalStyles}
          ariaHideApp={false}
        >
          <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
          <p className="mb-6">
            Are you sure you want to {selectedUser.isActive ? 'block' : 'unblock'} user{' '}
            <strong>{selectedUser.name}</strong>?
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={closeConfirmationModal}
              className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmToggleBlockStatus}
              className={`py-2 px-4 text-white rounded-lg ${
                selectedUser.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              } transition duration-200`}
            >
              Confirm
            </button>
          </div>
        </ReactModal>
      )}
    </div>
  );
};

export default Users;
