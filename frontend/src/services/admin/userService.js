import axios from 'axios';

//Admin: Get all Users
export const fetchUsers = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get('http://localhost:3000/admin/users', {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
  return response.data;
};

//Admin: Block an User
export const toggleBlockUser = async (userId) => {
  const token = localStorage.getItem('adminToken');
  // console.log(token);
  // console.log(userId);
  const response = await axios.put(`http://localhost:3000/admin/users/${userId}/block`, {}, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
  console.log(response);
  return response.data;
};
