import React, { useState, useEffect, useCallback } from "react";
import { message, Spin, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import SearchFormMail from "./SearchFormMail";
import { actionsColumnMail, columnMails, Mail } from "../data";
import { deleteMail, searchMail } from "../api/sendMail.api";
import { searchFolder } from "../api/folders.api";
import InsertUpdateMail from "./InsertUpdateMail";
import PreviewMail from "./PreviewMail";
import MoveMailModal from "./FolderTree/MoveMailModal";

interface MailManagementProps {
  selectedFolderId: number | null;
}

function MailManagement({ selectedFolderId }: MailManagementProps) {
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [loading, setLoading] = useState(false);
  const [mails, setMails] = useState<Mail[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [moveMailModalVisible, setMoveMailModalVisible] = useState(false);
  const [selectedMailForMove, setSelectedMailForMove] = useState<Mail | null>(
    null
  );

  const getChildFolderIds = useCallback(
    async (parentId: number): Promise<number[]> => {
      try {
        const response = await searchFolder({ parentId });
        const childFolders: any[] = response.data;
        const childIds = childFolders.map((folder: any) => folder.id);
        const grandChildIds = await Promise.all(
          childIds.map(getChildFolderIds)
        );
        return [parentId, ...childIds, ...grandChildIds.flat()];
      } catch (error) {
        console.error("Error fetching child folders:", error);
        return [parentId];
      }
    },
    []
  );

  const fetchMails = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedFolderId === null) {
        const response = await searchMail();
        const data: any = response.data.map((mail: Mail) => ({
          ...mail,
          folderId: mail.folderId || null,
        }));
        setMails(data);
      } else {
        const folderIds = await getChildFolderIds(selectedFolderId);
        const mailResponses = await Promise.all(
          folderIds.map((folderId) =>
            searchMail({ folderId }).catch(() => ({ data: [] }))
          )
        );
        const allMails = mailResponses.flatMap(
          (response: any) => response.data
        );
        const data: any = allMails.map((mail: Mail) => ({
          ...mail,
          folderId: mail.folderId || null,
        }));
        setMails(data);
      }
    } catch (error) {
      console.error("Error fetching mails:", error);
      setMails([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFolderId, getChildFolderIds]);

  useEffect(() => {
    fetchMails();
  }, [fetchMails]);

  const handleMoveMail = (mail: Mail) => {
    setSelectedMailForMove(mail);
    setMoveMailModalVisible(true);
  };

  const handleMoveMailSuccess = useCallback(async () => {
    setMoveMailModalVisible(false);
    setSelectedMailForMove(null);
    await fetchMails();
  }, [fetchMails]);

  const openModalAdd = () => {
    setSelectedMail(null);
    setIsModalVisible(true);
  };

  const openModalUpdate = (record: Mail) => {
    setSelectedMail(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (mailId: number) => {
    setLoading(true);
    try {
      await deleteMail(mailId);
      await fetchMails();
      message.success("Xoá mail thành công");
    } catch (error) {
      message.error("Failed to delete mail");
    }
    setLoading(false);
  };

  const onSearch = async (values: Partial<any>) => {
    setLoading(true);
    let idMailResults: Mail[] = [];
    let mailNameResults: Mail[] = [];

    try {
      if (values.idMail) {
        const respIdMail = await searchMail({ idMail: values.idMail });
        idMailResults = respIdMail.data || [];
      }
    } catch (error) {
      console.error("Error searching by idMail:", error);
    }

    try {
      if (values.mailName) {
        const respMailName = await searchMail({ mailName: values.mailName });
        mailNameResults = respMailName.data || [];
      }
    } catch (error) {
      console.error("Error searching by mailName:", error);
    }

    const combinedData = [...idMailResults, ...mailNameResults];

    if (combinedData.length > 0) {
      const uniqueData: any = Array.from(
        new Set(combinedData.map((item) => item.id))
      ).map((id) => combinedData.find((item) => item.id === id));
      setMails(uniqueData);
    } else {
      message.warning("Không tìm thấy mail nào");
    }

    setLoading(false);
  };

  const onSaveSuccess = useCallback(() => {
    setIsModalVisible(false);
    fetchMails();
  }, [fetchMails]);

  const openDrawerPreview = (record: Mail) => {
    setSelectedMail(record);
    setIsPreviewVisible(true);
  };

  const columns: ColumnsType<Mail> = [
    ...columnMails,
    actionsColumnMail(
      openModalUpdate,
      handleDelete,
      openDrawerPreview,
      handleMoveMail
    ),
  ];

  return (
    <div className="p-5">
      <a href="/mail">
        <h1 className="font-bold text-2xl text-blue-500 mb-2 text-left">
          Danh sách mail
        </h1>
      </a>
      <SearchFormMail
        onResetData={fetchMails}
        onSearch={onSearch}
        openModalAdd={openModalAdd}
      />
      {isModalVisible && (
        <InsertUpdateMail
          selectedMail={selectedMail}
          onSuccess={onSaveSuccess}
          onCancel={() => setIsModalVisible(false)}
        />
      )}
      {isPreviewVisible && (
        <PreviewMail
          onSuccess={onSaveSuccess}
          selectedMail={selectedMail}
          onCancel={() => setIsPreviewVisible(false)}
        />
      )}
      {moveMailModalVisible && selectedMailForMove && (
        <MoveMailModal
          visible={moveMailModalVisible}
          onCancel={() => setMoveMailModalVisible(false)}
          onSuccess={handleMoveMailSuccess}
          mailId={selectedMailForMove.id}
          mailCurrentFolderId={selectedMailForMove.folderId}
        />
      )}
      <Spin spinning={loading} tip={loading ? "Đang tải..." : ""}>
        <div style={{ marginTop: 20 }}>
          <Table dataSource={mails} columns={columns} bordered />
        </div>
      </Spin>
    </div>
  );
}

export default MailManagement;
