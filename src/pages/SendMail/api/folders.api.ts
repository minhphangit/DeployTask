import axios from "axios";
import { Folder } from "../data";

const insertFolder = (data: any) =>
  axios.post(
    "https://66835d634102471fa4c9d978.mockapi.io/api/v1/folders",
    data
  );

const updateFolder = (data: Folder) =>
  axios.put(
    `https://66835d634102471fa4c9d978.mockapi.io/api/v1/folders/${data.id}`,
    data
  );
const deleteFolder = (id: number) =>
  axios.delete(
    `https://66835d634102471fa4c9d978.mockapi.io/api/v1/folders/${id}`
  );
const searchFolder = (params: Partial<Folder> = {}) =>
  axios.get("https://66835d634102471fa4c9d978.mockapi.io/api/v1/folders", {
    params,
  });

export { insertFolder, updateFolder, deleteFolder, searchFolder };
