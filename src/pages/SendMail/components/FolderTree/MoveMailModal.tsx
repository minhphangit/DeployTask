import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Select, message, Spin } from "antd";
import { Folder } from "../../data";
import { searchFolder } from "../../api/folders.api";
import { updateMail } from "../../api/sendMail.api";

interface MoveMailModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  mailId: number;
  mailCurrentFolderId: number | null;
}

const MoveMailModal: React.FC<MoveMailModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  mailId,
  mailCurrentFolderId,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);

  const fetchFolders = useCallback(async () => {
    setLoadingFolders(true);
    try {
      const response = await searchFolder();
      setFolders(response.data);

      const currentFolder = response.data.find(
        (folder: Folder) => folder.folderId === mailCurrentFolderId
      );
      if (currentFolder) {
        setSelectedFolderId(currentFolder.folderId);
      }
    } catch (error) {
      message.error("Failed to load folders");
    } finally {
      setLoadingFolders(false);
    }
  }, [mailCurrentFolderId]);

  useEffect(() => {
    if (visible) {
      fetchFolders();
    }
  }, [visible, fetchFolders]);

  const handleMove = useCallback(async () => {
    if (!selectedFolderId || selectedFolderId === mailCurrentFolderId) {
      message.warning("Vui lòng chọn một thư mục khác");
      return;
    }

    setLoading(true);
    try {
      const data: any = { id: mailId, folderId: selectedFolderId };
      await updateMail(data);
      message.success("Di chuyển mail sang thư mục khác thành công!");
      onSuccess();
    } catch (error) {
      message.error("Di chuyển mail sang thư mục khác thất bại!");
    } finally {
      setLoading(false);
    }
  }, [selectedFolderId, mailCurrentFolderId, mailId, onSuccess]);

  const getFolderName = useCallback(
    (folderId: number | null) => {
      const folder = folders.find((f) => f.folderId === folderId);
      return folder ? folder.name : "";
    },
    [folders]
  );

  const isMovePossible = useMemo(
    () => selectedFolderId !== null && selectedFolderId !== mailCurrentFolderId,
    [selectedFolderId, mailCurrentFolderId]
  );

  const filteredFolders = useMemo(
    () => folders.filter((folder) => folder.folderId !== mailCurrentFolderId),
    [folders, mailCurrentFolderId]
  );

  return (
    <Modal
      title="Di chuyển mail sang thư mục khác"
      open={visible}
      okText="Di chuyển"
      cancelText="Đóng"
      onCancel={onCancel}
      onOk={handleMove}
      confirmLoading={loading}
      okButtonProps={{ disabled: !isMovePossible }}
    >
      <Spin spinning={loadingFolders}>
        <p>Chọn thư mục để di chuyển:</p>
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn thư mục"
          showSearch
          filterOption={(input, option: any) => {
            return (
              option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
          }}
          onChange={(value: any) => setSelectedFolderId(value)}
          value={getFolderName(selectedFolderId)}
          disabled={loadingFolders || loading}
        >
          {filteredFolders.map((folder) => (
            <Select.Option key={folder.folderId} value={folder.folderId}>
              {folder.name}
            </Select.Option>
          ))}
        </Select>
      </Spin>
    </Modal>
  );
};

export default MoveMailModal;
