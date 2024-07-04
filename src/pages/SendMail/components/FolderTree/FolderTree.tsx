import React, { useState, useRef, useCallback, useEffect } from "react";
import { Divider, message, Tooltip } from "antd";
import { useFolders } from "../../hooks/useFolders";
import {
  buildTreeFromFolders,
  getNextFolderId,
  getNextFolderOrder,
  truncateFolderName,
} from "../../data";
import {
  DeleteFolderModal,
  FolderActions,
  FolderInput,
  FolderTreeView,
} from "./FolderActions";
import { TreeProps } from "antd/lib";

interface FolderTreeProps {
  onFolderSelect: (folderId: number | null) => void;
}

const FolderTree: React.FC<FolderTreeProps> = ({ onFolderSelect }) => {
  const {
    folders,
    selectedKeys,
    setSelectedKeys,
    isLoading,
    addFolder,
    updateFolderName,
    deleteSelectedFolder,
    hasMails,
    hasSubfolders,
    moveFolder,
  } = useFolders();

  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [addingToFolderId, setAddingToFolderId] = useState<number | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [focusTrigger, setFocusTrigger] = useState(0);

  const inputRef = useRef<any>(null);
  const inputEditRef = useRef<any>(null);
  const inputAddRef = useRef<any>(null);

  useEffect(() => {
    const focusInput = () => {
      if (editingFolderId && inputEditRef.current) {
        inputEditRef.current.focus();
      } else if (addingFolder) {
        if (addingToFolderId === null && inputRef.current) {
          inputRef.current.focus();
        } else if (addingToFolderId !== null && inputAddRef.current) {
          setSelectedKeys([]);
          inputAddRef.current.focus();
        }
      }
    };

    setTimeout(focusInput, 0);
  }, [
    editingFolderId,
    addingFolder,
    addingToFolderId,
    focusTrigger,
    setSelectedKeys,
  ]);

  const handleAddFolder = useCallback(() => {
    if (selectedKeys.length > 0) {
      const selectedFolder = folders.find(
        (f) => f.folderId === Number(selectedKeys[0])
      );
      if (selectedFolder && selectedFolder.level >= 4) {
        message.warning(`Giới hạn tạo thư mục là 4 thư mục`);
        return;
      }
      setAddingToFolderId(Number(selectedKeys[0]));
    } else {
      setAddingToFolderId(null);
    }
    setAddingFolder(true);
    setNewFolderName("");
    setFocusTrigger((prev) => prev + 1);
  }, [folders, selectedKeys]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewFolderName(e.target.value);
    },
    []
  );

  const createNewFolder = useCallback(async () => {
    if (newFolderName.trim() && !isLoading) {
      const newFolder = {
        folderId: getNextFolderId(folders),
        name: newFolderName,
        parentId: addingToFolderId,
        level: addingToFolderId
          ? folders.find((f) => f.folderId === addingToFolderId)?.level! + 1
          : 1,
        order: getNextFolderOrder(folders, addingToFolderId),
      };

      await addFolder(newFolder);
      setAddingFolder(false);
      setNewFolderName("");
      setAddingToFolderId(null);
    } else {
      setAddingFolder(false);
      setAddingToFolderId(null);
    }
  }, [newFolderName, isLoading, addingToFolderId, folders, addFolder]);

  const handleEditFolder = useCallback(() => {
    if (selectedKeys.length > 0) {
      const selectedFolder = folders.find(
        (f) => f.folderId === Number(selectedKeys[0])
      );
      if (selectedFolder) {
        setEditingFolderId(selectedFolder.folderId);
        setNewFolderName(selectedFolder.name);
        setFocusTrigger((prev) => prev + 1);
      }
    } else {
      message.info("Vui lòng chọn thư mục để sửa tên thư mục");
    }
  }, [folders, selectedKeys]);

  const handleUpdateFolderName = useCallback(async () => {
    if (editingFolderId && newFolderName.trim() && !isLoading) {
      const currentFolder = folders.find((f) => f.folderId === editingFolderId);
      if (currentFolder && currentFolder.name !== newFolderName.trim()) {
        await updateFolderName(editingFolderId, newFolderName.trim());
      }
      setEditingFolderId(null);
      setNewFolderName("");
    } else {
      setEditingFolderId(null);
    }
  }, [editingFolderId, newFolderName, isLoading, updateFolderName, folders]);

  const handleDeleteFolder = useCallback(async () => {
    if (selectedKeys.length === 0) {
      message.warning("Vui lòng chọn thư mục để xóa");
      return;
    }

    const folderId = Number(selectedKeys[0]);

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
  }, [selectedKeys, hasSubfolders, hasMails]);

  const handleConfirmDelete = useCallback(async () => {
    const isDeleted = await deleteSelectedFolder();
    if (isDeleted) {
      setIsDeleteModalVisible(false);
    }
  }, [deleteSelectedFolder]);

  const handleInputBlur = useCallback(() => {
    if (editingFolderId) {
      handleUpdateFolderName();
    } else {
      createNewFolder();
    }
  }, [editingFolderId, handleUpdateFolderName, createNewFolder]);

  const handleInputKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (editingFolderId) {
          handleUpdateFolderName();
        } else {
          createNewFolder();
        }
      }
    },
    [editingFolderId, handleUpdateFolderName, createNewFolder]
  );

  const renderFolderTitle = useCallback(
    (folder: any) => {
      const truncatedName = truncateFolderName(folder.name);
      return (
        <>
          {editingFolderId === folder.folderId ? (
            <FolderInput
              value={newFolderName}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleInputKeyPress}
              placeholder="Nhập tên thư mục"
              inputRef={inputEditRef}
            />
          ) : (
            <Tooltip title={folder.name}>
              <span>{truncatedName}</span>
            </Tooltip>
          )}

          {addingToFolderId === folder.folderId && (
            <div style={{ marginLeft: "20px" }}>
              <FolderInput
                value={newFolderName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyPress={handleInputKeyPress}
                placeholder="Nhập tên thư mục"
                inputRef={inputAddRef}
              />
            </div>
          )}
        </>
      );
    },
    [
      editingFolderId,
      newFolderName,
      addingToFolderId,
      handleInputChange,
      handleInputBlur,
      handleInputKeyPress,
    ]
  );

  const treeData = buildTreeFromFolders(folders, renderFolderTitle);

  const onSelect = useCallback(
    (keys: React.Key[], info: any) => {
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
    [onFolderSelect, setSelectedKeys]
  );

  const onExpand = useCallback((keys: React.Key[], info: any) => {
    console.log("Trigger Expand", keys, info);
  }, []);

  const onDrop: TreeProps["onDrop"] = async (info: any) => {
    const dropKey = info.node.key as number;
    const dragKey = info.dragNode.key as number;
    const dropPos = info.node.pos.split("-");
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    await moveFolder(dragKey, dropKey, dropPosition);
  };
  return (
    <div className="border-dashed border-2 p-5">
      <FolderActions
        onAddFolder={handleAddFolder}
        onEditFolder={handleEditFolder}
        onDeleteFolder={handleDeleteFolder}
      />
      <Divider />

      <FolderTreeView
        onDrop={onDrop}
        treeData={treeData}
        selectedKeys={selectedKeys}
        onSelect={onSelect}
        onExpand={onExpand}
      />

      {addingFolder && addingToFolderId === null && (
        <FolderInput
          value={newFolderName}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleInputKeyPress}
          placeholder="Nhập tên thư mục"
          inputRef={inputRef}
        />
      )}

      <DeleteFolderModal
        isVisible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isLoading}
      />
    </div>
  );
};

export default FolderTree;
