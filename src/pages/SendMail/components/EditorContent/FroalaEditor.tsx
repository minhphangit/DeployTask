import React from "react";
import FroalaEditor from "react-froala-wysiwyg";
import "froala-editor/js/plugins.pkgd.min.js";

interface FroalaEditorComponentProps {
  content: string;
  onModelChange: (model: any) => void;
}

const FroalaEditorComponent: React.FC<FroalaEditorComponentProps> = ({
  content,
  onModelChange,
}) => {
  const config = {
    placeholderText: "Chỉnh sửa nội dung ở đây!",
    charCounterCount: false,
  };

  return (
    <div>
      <FroalaEditor
        tag="textarea"
        config={config}
        model={content}
        onModelChange={onModelChange}
      />
    </div>
  );
};

export default FroalaEditorComponent;
