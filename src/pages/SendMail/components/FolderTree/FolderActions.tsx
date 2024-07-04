import React from "react";
import { Tree, Input, Modal, Button } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { PlusIcon } from "lucide-react";

const { DirectoryTree } = Tree;

export const FolderActions: React.FC<{
  onAddFolder: () => void;
  onEditFolder: () => void;
  onDeleteFolder: () => void;
}> = ({ onAddFolder, onEditFolder, onDeleteFolder }) => (
  <div className="flex gap-3 ">
    <span onClick={onAddFolder} className="cursor-pointer">
      <PlusIcon size={35} className="border-dashed border-2 p-2 rounded-full" />
    </span>
    <span onClick={onEditFolder} className="cursor-pointer">
      <EditOutlined
        className="border-dashed border-2 p-2 rounded-full"
        style={{ fontSize: "16px" }}
      />
    </span>
    <span onClick={onDeleteFolder} className="cursor-pointer">
      <DeleteOutlined
        className="border-dashed border-2 p-2 rounded-full border-red-500"
        style={{ fontSize: "14px", color: "red" }}
      />
    </span>
  </div>
);

export const FolderInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  inputRef: React.RefObject<any>;
}> = ({ value, onChange, onBlur, onKeyPress, placeholder, inputRef }) => (
  <Input
    ref={inputRef}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    onKeyPress={onKeyPress}
    size="small"
    placeholder={placeholder}
    style={{ width: "80%" }}
  />
);

export const DeleteFolderModal: React.FC<{
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ isVisible, onCancel, onConfirm, isDeleting }) => (
  <Modal
    title="Xác nhận xóa thư mục"
    open={isVisible}
    onCancel={onCancel}
    footer={[
      <Button key="back" onClick={onCancel}>
        Đóng
      </Button>,
      <Button
        key="submit"
        type="primary"
        danger
        loading={isDeleting}
        onClick={onConfirm}
      >
        Xóa
      </Button>,
    ]}
    maskClosable={true}
  >
    <p>Bạn có chắc chắn muốn xóa thư mục này?</p>
  </Modal>
);

export const FolderTreeView: React.FC<{
  treeData: any[];
  selectedKeys: React.Key[];
  onSelect: (keys: React.Key[], info: any) => void;
  onExpand: (keys: React.Key[], info: any) => void;
  onDrop: (info: any) => void;
}> = ({ treeData, selectedKeys, onSelect, onExpand, onDrop }) => (
  <DirectoryTree
    multiple={false}
    showLine={true}
    draggable
    blockNode
    onDrop={onDrop}
    defaultExpandAll
    onSelect={onSelect}
    onExpand={onExpand}
    selectedKeys={selectedKeys}
    treeData={treeData}
    style={{ textAlign: "left" }}
  />
);
