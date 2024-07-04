import { useState } from "react";
import { Col, Divider, Row } from "antd";
import MailManagement from "./components/MailManagement";
import FolderTree from "./components/FolderTree/FolderTree";

export default function Mails() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  return (
    <div>
      <h1 className="font-bold mb-3">THƯ VIỆN TÀI LIỆU</h1>
      <Divider />
      <Row gutter={24}>
        <Col className="gutter-row" span={7}>
          <FolderTree onFolderSelect={setSelectedFolderId} />
        </Col>
        <Col className="gutter-row border-dashed border-2" span={17}>
          <MailManagement selectedFolderId={selectedFolderId} />
        </Col>
      </Row>
    </div>
  );
}
