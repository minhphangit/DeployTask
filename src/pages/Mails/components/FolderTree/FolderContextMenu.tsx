import React, { useEffect, useRef } from "react";
import { Menu } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface ContextMenuProps {
  x: number;
  y: number;
  onAddFolder: () => void;
  onEditFolder: () => void;
  onDeleteFolder: () => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleMenuClick = (e: { key: string }) => {
    switch (e.key) {
      case "add":
        onAddFolder();
        break;
      case "edit":
        onEditFolder();
        break;
      case "delete":
        onDeleteFolder();
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: y,
        left: x,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        background: "white",
        zIndex: 1000,
      }}
    >
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="add" icon={<PlusOutlined />}>
          Thêm thư mục
        </Menu.Item>
        <Menu.Item key="edit" icon={<EditOutlined />}>
          Sửa thư mục
        </Menu.Item>
        <Menu.Item key="delete" icon={<DeleteOutlined />}>
          Xóa thư mục
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default ContextMenu;
