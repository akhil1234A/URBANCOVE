import { adminAxios } from "../../utils/api";

//Admin: Get all Users
export const fetchUsers = async (page, limit) => {
  const response = await adminAxios.get(`/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};

//Admin: Block an User
export const toggleBlockUser = async (userId) => {
  const response = await adminAxios.put(`/admin/users/${userId}/block`);
  return response.data;
};
