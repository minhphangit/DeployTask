import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { Folder } from "../data";
import {
  deleteFolder,
  insertFolder,
  searchFolder,
  updateFolder,
} from "../api/folders.api";
import { searchMail } from "../api/sendMail.api";

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await searchFolder();
      setFolders(resp.data);
    } catch (error) {
      message.error("Failed to load folders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const addFolder = useCallback(
    async (newFolder: Partial<Folder>) => {
      const loadingMessage = message.loading("Đang tạo thư mục...", 0);
      setIsLoading(true);
      try {
        await insertFolder(newFolder);
        await fetchFolders();
        message.success("Tạo thành công thư mục");
      } catch (error) {
        message.error("Tạo thư mục thất bại");
      } finally {
        loadingMessage();
        setIsLoading(false);
      }
    },
    [fetchFolders]
  );

  const updateFolderName = useCallback(
    async (folderId: number, newName: string) => {
      const loadingMessage = message.loading("Đang cập nhập thư mục...", 0);
      setIsLoading(true);
      try {
        const folderToUpdate = folders.find((f) => f.folderId === folderId);
        if (folderToUpdate) {
          await updateFolder({ ...folderToUpdate, name: newName });
          await fetchFolders();
          message.success("Cập nhật thành công thư mục");
        }
      } catch (error) {
        message.error("Cập nhật thư mục thất bại");
      } finally {
        loadingMessage();
        setIsLoading(false);
      }
    },
    [folders, fetchFolders]
  );

  const deleteSelectedFolder = useCallback(async (): Promise<boolean> => {
    if (selectedKeys.length === 0) {
      message.warning("Vui lòng chọn thư mục để xóa");
      return false;
    }

    const folderId = Number(selectedKeys[0]);
    setIsLoading(true);
    try {
      await deleteFolder(folderId);
      await fetchFolders();
      setSelectedKeys([]);
      message.success("Xóa thư mục thành công");
      return true;
    } catch (error) {
      message.error("Xóa thư mục thất bại");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedKeys, fetchFolders]);

  const hasMails = useCallback(async (folderId: number): Promise<boolean> => {
    try {
      const mails = await searchMail({ folderId });
      return mails.data.length > 0;
    } catch (error) {
      console.error("Error checking for mails:", error);
      return false;
    }
  }, []);

  const hasSubfolders = useCallback(
    (folderId: number): boolean => {
      return folders.some((folder) => folder.parentId === folderId);
    },
    [folders]
  );

  const moveFolder = useCallback(
    async (
      dragKey: number,
      dropKey: number | null,
      dropPosition: number
    ): Promise<boolean> => {
      const loadingMessage = message.loading("Đang di chuyển thư mục...", 0);
      setIsLoading(true);
      try {
        const dragFolder = folders.find((f) => f.folderId === dragKey);
        const dropFolder = folders.find((f) => f.folderId === dropKey);

        if (!dragFolder) {
          throw new Error("Không tìm thấy thư mục được kéo");
        }

        let newParentId: number | null = null;
        let newLevel: number = 1;

        if (dropPosition === 0) {
          newParentId = dropKey;
          newLevel = (dropFolder?.level || 0) + 1;
        } else {
          newParentId = dropFolder?.parentId || null;
          newLevel = dropFolder?.level || 1;
        }

        if (newLevel > 4) {
          message.warning(
            "Không thể di chuyển. Đã đạt giới hạn cấp độ thư mục."
          );
          return false;
        }

        const updatedFolder: Folder = {
          ...dragFolder,
          parentId: newParentId,
          level: newLevel,
        };

        await updateFolder(updatedFolder);
        await fetchFolders();
        message.success("Di chuyển thư mục thành công");
        return true;
      } catch (error) {
        console.error("Error moving folder:", error);
        message.error("Di chuyển thư mục thất bại");
        return false;
      } finally {
        loadingMessage();
        setIsLoading(false);
      }
    },
    [folders, fetchFolders]
  );

  return {
    folders,
    selectedKeys,
    setSelectedKeys,
    isLoading,
    fetchFolders,
    addFolder,
    updateFolderName,
    deleteSelectedFolder,
    hasMails,
    hasSubfolders,
    moveFolder,
  };
};
