import React, { useState, useEffect, useRef, useCallback } from "react";
import { Divider, message, Tree, Input, Modal, Button } from "antd";
import type { GetProps } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { PlusIcon } from "lucide-react";
import { buildTreeFromFolders, Folder, Mail } from "../../data";
import {
  deleteFolder,
  searchFolder,
  insertFolder,
  updateFolder,
} from "../../api/folders.api";
import { searchMail } from "../../api/sendMail.api";
import { AxiosResponse } from "axios";

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

const { DirectoryTree } = Tree;

interface FolderTreeProps {
  onFolderSelect: (folderId: number | null) => void;
}

const FolderTree: React.FC<FolderTreeProps> = ({ onFolderSelect }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [addingFolder, setAddingFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const inputRef = useRef<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFolders = useCallback(async () => {
    try {
      const resp = await searchFolder();
      setFolders(resp.data);
    } catch (error) {
      message.error("Failed to load folders");
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    if ((addingFolder || editingFolder) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingFolder, editingFolder]);

  const handleAddFolder = useCallback(() => {
    if (selectedKeys.length > 0) {
      const selectedFolder = folders.find(
        (f) => f.folderId === Number(selectedKeys[0])
      );
      if (selectedFolder && selectedFolder.level >= 4) {
        message.warning(`Giới hạn tạo thư mục là 4 thư mục`);
        return;
      }
    }
    setAddingFolder(true);
    setEditingFolder(null);
    setNewFolderName("");
  }, [folders, selectedKeys]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewFolderName(e.target.value);
    },
    []
  );

  const createNewFolder = useCallback(async () => {
    if (newFolderName.trim() && !isCreating) {
      setIsCreating(true);
      const loadingMessage = message.loading("Đang tạo thư mục...", 0);
      const selectedFolder = selectedKeys[0] ? Number(selectedKeys[0]) : null;
      const newFolder: any = {
        folderId:
          folders.length === 0
            ? 1
            : Math.max(...folders.map((f) => f.folderId)) + 1,
        name: newFolderName,
        parentId: selectedFolder,
        level: selectedFolder
          ? folders.find((f) => f.folderId === selectedFolder)?.level! + 1
          : 1,
        order: folders.filter((f) => f.parentId === selectedFolder).length + 1,
      };

      try {
        await insertFolder(newFolder);
        await fetchFolders();
        setAddingFolder(false);
        setNewFolderName("");
        loadingMessage();
        message.success("Tạo thành công thư mục");
      } catch (error) {
        loadingMessage();
        message.error("Tạo thư mục thất bại");
      } finally {
        setIsCreating(false);
      }
    } else {
      setAddingFolder(false);
    }
  }, [newFolderName, isCreating, selectedKeys, folders, fetchFolders]);

  const handleInputBlur = useCallback(() => {
    if (addingFolder) {
      createNewFolder();
    } else if (editingFolder) {
      updateFolderName();
    }
  }, [addingFolder, editingFolder, createNewFolder]);

  const handleInputKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (addingFolder) {
          createNewFolder();
        } else if (editingFolder) {
          updateFolderName();
        }
      }
    },
    [addingFolder, editingFolder, createNewFolder]
  );

  const handleEditFolder = useCallback(() => {
    if (selectedKeys.length > 0) {
      const selectedFolder = folders.find(
        (f) => f.folderId === Number(selectedKeys[0])
      );
      if (selectedFolder) {
        setEditingFolder(selectedFolder.folderId);
        setNewFolderName(selectedFolder.name);
        setAddingFolder(false);
      }
    } else {
      message.info("Vui lòng chọn thư mục để sửa tên thư mục");
    }
  }, [folders, selectedKeys]);

  const updateFolderName = useCallback(async () => {
    if (editingFolder && newFolderName.trim() && !isUpdating) {
      setIsUpdating(true);
      const loadingMessage = message.loading("Đang cập nhật thư mục...", 0);
      const updatedFolder = folders.find((f) => f.folderId === editingFolder);
      if (updatedFolder) {
        if (updatedFolder.name !== newFolderName.trim()) {
          try {
            await updateFolder({
              ...updatedFolder,
              name: newFolderName.trim(),
            });
            await fetchFolders();
            loadingMessage();
            message.success("Cập nhật thành công thư mục");
          } catch (error) {
            loadingMessage();
            message.error("Cập nhật thư mục thất bại");
          } finally {
            setIsUpdating(false);
          }
        } else {
          loadingMessage();
          message.info("Tên thư mục không thay đổi");
          setIsUpdating(false);
        }
        setEditingFolder(null);
        setNewFolderName("");
      }
    } else {
      setEditingFolder(null);
    }
  }, [editingFolder, newFolderName, isUpdating, folders, fetchFolders]);

  const hasMails = useCallback(async (folderId: number): Promise<boolean> => {
    try {
      const mails: AxiosResponse<Mail[], any> = await searchMail({ folderId });
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

  const handleDeleteFolder = useCallback(async () => {
    if (selectedKeys.length === 0) {
      message.warning("Vui lòng chọn thư mục để xóa");
      return;
    }

    const folderId = Number(selectedKeys[0]);
    const folderToDelete = folders.find((f) => f.folderId === folderId);

    if (!folderToDelete) {
      message.warning("Không tìm thấy thư mục");
      return;
    }

    if (hasSubfolders(folderId)) {
      message.warning("Không thể xóa thư mục chứa thư mục con");
      return;
    }

    const hasMail = await hasMails(folderId);
    if (hasMail) {
      message.warning("Không thể xóa thư mục chứa mẫu mail");
      return;
    }

    setIsDeleteModalVisible(true);
  }, [selectedKeys, folders, hasSubfolders, hasMails]);

  const confirmDelete = useCallback(async () => {
    const folderId = Number(selectedKeys[0]);
    setIsDeleting(true);
    const loadingMessage = message.loading("Đang xóa thư mục...", 0);

    try {
      await deleteFolder(folderId);
      await fetchFolders();
      setSelectedKeys([]);
      loadingMessage();
      message.success("Xóa thư mục thành công");
    } catch (error) {
      loadingMessage();
      message.error("Xóa thư mục thất bại");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
    }
  }, [selectedKeys, fetchFolders]);

  const onSelect: DirectoryTreeProps["onSelect"] = useCallback(
    (keys: any, info: any) => {
      const clickedKey = keys[0];
      setSelectedKeys((prevKeys) => {
        if (prevKeys.includes(clickedKey)) {
          onFolderSelect(null);
          return [];
        } else {
          onFolderSelect(Number(clickedKey));
          return [clickedKey];
        }
      });
    },
    [onFolderSelect]
  );

  const onExpand: DirectoryTreeProps["onExpand"] = useCallback(
    (keys: any, info: any) => {
      console.log("Trigger Expand", keys, info);
    },
    []
  );

  return (
    <div className="border-dashed border-2 p-5">
      <div className="flex gap-3 ">
        <span onClick={handleAddFolder} className="cursor-pointer">
          <PlusIcon
            size={35}
            className="border-dashed border-2 p-2 rounded-full"
          />
        </span>
        <span onClick={handleEditFolder} className="cursor-pointer">
          <EditOutlined
            className="border-dashed border-2 p-2 rounded-full"
            style={{ fontSize: "16px" }}
          />
        </span>
        <span onClick={handleDeleteFolder} className="cursor-pointer">
          <DeleteOutlined
            className="border-dashed border-2 p-2 rounded-full border-red-500"
            style={{ fontSize: "14px", color: "red" }}
          />
        </span>
      </div>
      <Divider />
      {(addingFolder || editingFolder) && (
        <Input
          ref={inputRef}
          value={newFolderName}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleInputKeyPress}
          placeholder={editingFolder ? "Sửa tên thư mục" : "Nhập tên thư mục"}
          style={{ marginBottom: "10px" }}
        />
      )}
      <DirectoryTree
        multiple={false}
        showLine={true}
        defaultExpandAll
        onSelect={onSelect}
        onExpand={onExpand}
        selectedKeys={selectedKeys}
        treeData={buildTreeFromFolders(folders)}
        style={{ textAlign: "left" }}
      />
      <Modal
        title="Xác nhận xóa thư mục"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDeleteModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={isDeleting}
            onClick={confirmDelete}
          >
            Xóa
          </Button>,
        ]}
        maskClosable={true}
      >
        <p>Bạn có chắc chắn muốn xóa thư mục này?</p>
      </Modal>
    </div>
  );
};

export default FolderTree;
