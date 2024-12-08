import { adminAxios } from "../../utils/api";



//Admin: Login 
export const loginAdmin = async (email, password) => {
  const response = await adminAxios.post(`/admin/login`, { email, password });
  return response.data;
};
