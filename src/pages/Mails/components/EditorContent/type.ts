import { Dispatch, SetStateAction } from "react";

type ModeEdit = 'editor' | 'text';

type DynamicEditorProps = {
  modeEdit?: ModeEdit;
  readOnly?:boolean;
  editorProps?: {
    [key: string]: any;
  }
  value: string;
  setValue?: Dispatch<SetStateAction<string>>;
  isEditHtml?:boolean; 
};

export type {DynamicEditorProps,ModeEdit}