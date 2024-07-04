import React from "react";
import { Menu } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface FolderContextMenuProps {
  onAddFolder: () => void;
  onEditFolder: () => void;
  onDeleteFolder: () => void;
}

const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
}) => {
  return (
    <Menu>
      <Menu.Item key="add" icon={<PlusOutlined />} onClick={onAddFolder}>
        Thêm thư mục
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEditFolder}>
        Sửa thư mục
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={onDeleteFolder}
      >
        Xóa thư mục
      </Menu.Item>
    </Menu>
  );
};

export default FolderContextMenu;
