import { Button, Popconfirm, TreeDataNode } from "antd";
import { ColumnsType } from "antd/lib/table";
import { icons } from "../Users/data";
import { searchMail, uploadImage } from "./api/sendMail.api";
import { searchFolder } from "./api/folders.api";

export type Mail = {
  id: number;
  idMail: string;
  mailName: string;
  mailTitle: string;
  mailContent: string;
  birthday: Date;
  mailSender: string;
  mailReceiver: string;
  nameStudent: string;
  applicationCode: string;
  status: boolean;
  sentDate: Date;
  folderId: number;
};

export interface Folder {
  id: string;
  folderId: number;
  name: string;
  parentId: number | null;
  level: number;
  order: number;
}

// build tree from folders using recursion
function buildTreeFromFolders(
  folders: Folder[],
  parentId: number | null = null,
  level: number = 1
): TreeDataNode[] {
  if (level > 4) return [];

  return folders
    .filter((folder) => folder.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((folder) => ({
      title: folder.name,
      key: folder.id.toString(),
      children: buildTreeFromFolders(folders, Number(folder.id), level + 1),
      isLeaf: level === 5,
    }));
}

// check if folder can be deleted
async function canDeleteFolder(folderId: number): Promise<boolean> {
  const [subFolders, mails] = await Promise.all([
    searchFolder({ parentId: folderId }),
    searchMail({ folderId: folderId }),
  ]);
  return subFolders.data.length === 0 && mails.data.length === 0;
}

// define columns of table
const columnMails: ColumnsType<Mail> = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text: any, record: any, index: number) => {
      return <span>{index + 1}</span>;
    },
  },
  {
    title: "Tên",
    dataIndex: "mailName",
    key: "mailName",
  },
  {
    title: "Mã",
    dataIndex: "idMail",
    key: "idMail",
  },
];

// define actions column
const actionsColumnMail = (
  openModalUpdate: (record: Mail) => void,
  handleDelete: (mailId: number) => Promise<void>,
  openDrawerPreview: (record: Mail) => void,
  handleMoveMail: (mail: Mail) => void
) => ({
  title: "",
  key: "actions",
  width: "200px",

  render: (text: any, record: Mail) => (
    <>
      <Button
        icon={icons.edit}
        onClick={() => openModalUpdate(record)}
        style={{ marginRight: "5px" }}
      />
      <Button
        icon={icons.preview}
        onClick={() => openDrawerPreview(record)}
        style={{ marginRight: "5px" }}
      />
      <Button
        icon={icons.move}
        style={{ marginRight: "5px" }}
        onClick={() => handleMoveMail(record)}
      />
      <Popconfirm
        title="Are you sure to delete this mail?"
        onConfirm={() => handleDelete(record.id)}
        okText="Yes"
        cancelText="No"
      >
        <Button style={{ marginRight: "5px" }} icon={icons.delete} danger />
      </Popconfirm>
    </>
  ),
});

// replace {{key}} bằng giá trị tương ứng
const replaceVariables = (
  content: string,
  variables: Record<string, string>
) => {
  return content.replace(/{{(.*?)}}/g, (match, key) => {
    return variables[key.trim()] || match;
  });
};
//format date
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};
const extractBlobUrls = (content: string) => {
  const regex = /blob:http:\/\/localhost:3000\/[a-z0-9-]+/g;
  return content.match(regex) || [];
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const convertBlobUrlsToBase64 = async (content: string): Promise<string> => {
  const blobUrls = extractBlobUrls(content);
  for (const blobUrl of blobUrls) {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      content = content.replace(blobUrl, base64);
    } catch (error) {
      console.error("Error converting blob URL to base64:", error);
    }
  }
  return content;
};
// extract base64 images from content
const extractBase64Images = (content: string) => {
  const regex = /data:image\/[^;]+;base64,[^"]+/g;
  return content.match(regex) || [];
};
// convert base64 string to file
const convertBase64ToFile = (base64String: string, filename: string) => {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};
// upload image to server
const uploadImages = async (
  base64Images: string[]
): Promise<{ base64: string; url: string }[]> => {
  const uploadPromises = base64Images.map(async (base64, index) => {
    try {
      const file = convertBase64ToFile(base64, `image_${index}.png`);
      const url = await uploadImage(file);
      return { base64, url };
    } catch (error) {
      console.error(`Error uploading image ${index}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};
// replace base64 images with urls
const replaceBase64WithUrls = (
  content: string,
  replacements: { base64: string; url: string }[]
) => {
  let newContent = content;
  replacements.forEach(({ base64, url }) => {
    newContent = newContent.replace(base64, url);
  });
  return newContent;
};

export {
  columnMails,
  actionsColumnMail,
  replaceVariables,
  convertBlobUrlsToBase64,
  formatDate,
  extractBase64Images,
  uploadImages,
  replaceBase64WithUrls,
  buildTreeFromFolders,
  canDeleteFolder,
};
