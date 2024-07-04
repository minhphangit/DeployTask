import { User } from "../data";
import axiosClient from "../../../config/axiosClient";

const searchUser = (params: Partial<User> = {}) =>
  axiosClient.get<User[]>("/users", { params });
const insertUser = (data: User) => axiosClient.post("/users", data);
const updateUser = (data: User) => axiosClient.put(`/users/${data.id}`, data);
const deleteUser = (id: number) => axiosClient.delete(`/users/${id}`);

export { searchUser, insertUser, updateUser, deleteUser };
