import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import QuillEditor, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles.css";
import { Form, Segmented, Input } from "antd";
import { DynamicEditorProps, ModeEdit } from "./type";
import BlotFormatter from "quill-blot-formatter";

//fix emit error when drag image
var Block = Quill.import("blots/block");
class Div extends Block {}
Div.tagName = "div";
Div.blotName = "div";
Div.allowedChildren = Block.allowedChildren;
Div.allowedChildren.push(Block);

//fix save image with style
const ImageBase = Quill.import("formats/image");
const ATTRIBUTES = ["alt", "height", "width", "class", "style"];
export class CustomImage extends ImageBase {
  static formats(domNode: any) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      const copy = { ...formats } as any;

      if (domNode.hasAttribute(attribute)) {
        copy[attribute] = domNode.getAttribute(attribute);
      }

      return copy;
    }, {});
  }

  format(name: any, value: any) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

const DynamicEditor: React.FC<DynamicEditorProps> = ({
  value,
  setValue,
  editorProps = {},
  modeEdit,
  readOnly = false,
  isEditHtml = false,
}) => {
  const [editorValue, setEditorValue] = useState(value);
  const [status, setStatus] = useState<ModeEdit>("editor");
  const quill = useRef<any>(null);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  useEffect(() => {
    if (modeEdit) {
      setStatus(modeEdit);
    }
  }, [modeEdit]);

  const handleChange = (newValue: string) => {
    setEditorValue(newValue);
    setValue?.(newValue);
  };

  Quill.register("modules/blotFormatter", BlotFormatter); //resize image with blot formatter
  Quill.register("formats/image", CustomImage); //fix save image with style
  Quill.register(Div); //fix emit error when drag image
  const modules = useMemo(
    () => ({
      blotFormatter: {},
      toolbar: readOnly
        ? false
        : {
            container: [
              [{ header: [2, 3, 4, false] }],
              ["bold", "italic", "underline", "strike", "blockquote"],
              [{ color: [] }, { background: [] }],
              [
                { align: [] },
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
              ],
              ["link", "image"],
              ["clean"],
            ],
          },
      clipboard: {
        matchVisual: true,
      },
    }),
    [readOnly]
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
    "clean",
    // fix image resize
    "height",
    "width",
    "class",
    "style",
  ];

  return (
    <div className="dynamic-editor">
      {isEditHtml && !readOnly && (
        <Segmented
          value={status}
          options={[
            { label: "Editor", value: "editor" },
            { label: "Text", value: "text" },
          ]}
          onChange={(value: ModeEdit) => setStatus(value)}
          className="segmented"
        />
      )}

      {status === "editor" ? (
        <QuillEditor
          ref={quill}
          theme="snow"
          formats={formats}
          modules={modules}
          value={editorValue}
          onChange={handleChange}
          readOnly={readOnly}
          {...editorProps}
        />
      ) : (
        <Input.TextArea
          value={editorValue}
          onChange={(e) => handleChange(e.target.value)}
          style={{ height: 400 }}
          readOnly={readOnly}
          {...editorProps}
        />
      )}
    </div>
  );
};

export default DynamicEditor;
