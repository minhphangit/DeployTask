import React from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import BlotFormatter, {
  AlignAction,
  DeleteAction,
  ImageSpec,
  ResizeAction,
} from "quill-blot-formatter";

type Props = {
  value?: string;
  onChange?: () => void;
  placeholder?: string;
};

declare global {
  interface Window {
    Quill: any;
  }
}

export class CustomImageSpec extends ImageSpec {
  getActions() {
    return [DeleteAction, ResizeAction, AlignAction];
  }

  init() {
    this.formatter.quill.root.addEventListener("click", this.onClick);

    // handling scroll event
    this.formatter.quill.root.addEventListener("scroll", () => {
      this.formatter.repositionOverlay();
    });

    // handling resize event
    window.addEventListener("resize", () => {
      this.formatter.repositionOverlay();
    });

    // handling align
    this.formatter.quill.on("editor-change", (eventName: any, ...args: any) => {
      if (eventName === "selection-change" && args[2] === "api") {
        setTimeout(() => {
          this.formatter.repositionOverlay();
        }, 10);
      }
    });
  }
}

//Start Fix image/Video allignment
const ImageBase = Quill.import("formats/image");
const VideoBase = Quill.import("formats/video");

const ATTRIBUTES = [
  "alt",
  "height",
  "width",
  "class",
  "style", // This is the added difference that needs to be saved properly
];

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

export class CustomVideo extends VideoBase {
  static formats(domNode: any) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      const copy = { ...formats } as any;

      if (domNode.hasAttribute(attribute)) {
        copy[attribute] = domNode.getAttribute(attribute);
      }

      return copy;
    }, {});
  }

  static value(node: any) {
    return ATTRIBUTES.reduce(
      (attrs, attribute) => {
        const copy = { ...attrs } as any;

        if (node.hasAttribute(attribute)) {
          copy[attribute] = node.getAttribute(attribute);
        }

        return copy;
      },
      { src: node.getAttribute("src") }
    );
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
//End fix image allignment

const ContentEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  Quill.register("modules/blotFormatter", BlotFormatter);
  Quill.register("formats/image", CustomImage); //Fix image allignment
  Quill.register("formats/video", CustomVideo); //Fix video allignment
  const modules = {
    blotFormatter: {
      specs: [CustomImageSpec],
      overlay: {
        style: {
          border: "2px solid red",
        },
      },
    },
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { list: "check" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ script: "super" }],
      [
        { align: "" },
        { align: "center" },
        { align: "right" },
        { align: "justify" },
      ],
      ["link", "image", "video", "code"],
      ["clean"],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "align",
    "script",
    "indent",
    "link",
    "image",
    "video",
    "code",
    "code-block",
    // fix image resize
    "height",
    "width",
    "class",
    "style",
  ];
  return (
    <>
      <ReactQuill
        theme="snow"
        value={value || ""}
        modules={modules}
        formats={formats}
        onChange={onChange}
        placeholder={placeholder}
      />
    </>
  );
};
export default ContentEditor;
