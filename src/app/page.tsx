'use client';

import Button from "../components/button";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";

import * as commands from "@uiw/react-md-editor/commands"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

function capFirstLetter(str: string) {
  if (str.length == 0)
    return "";

  return str.charAt(0).toUpperCase() + str.slice(1);
}

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode | ReactNode[];
};

function Popup(props: PopupProps) {
  if (!props.isOpen) {
    return null;
  }

  return (
    <div className="popup-overlay" onClick={props.onClose}>
      <div className="popup-content" onClick={(e: Event) => e.stopPropagation()}>
        {props.children}
        <Button name="Close" onClick={props.onClose}/>
      </div>
    </div>
  );
}

export default function Home() {
  const [value, setValue] = useState("# Journal Entry");
  const [viewState, setViewState] = useState("edit");
  const [popupOpen, setPopupOpen] = useState(true);
  const [filename, setFilename] = useState("journal1.md");

  const handleClick = () => alert("Button click");

  const handleOpenPopup = () => setPopupOpen(true);
  const handleClosePopup = () => setPopupOpen(false);

  const handleDisplay = () => {
    switch (viewState) {
      case "edit":    { setViewState("live");    break; }
      case "live":    { setViewState("preview"); break; }
      case "preview": { setViewState("edit");    break; }
    }
  };

  const prependDate = () => {
    const now = new Date();
    const localizedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const timeOptions = { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    };
    const timeString = now.toLocaleString('en-US', timeOptions); 

    setValue("*" + localizedDate + " " + timeString + "*" + "\n\n" + value);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex gap-4">
          <Button name="New" onClick={handleClick}/>
          <Button name="Save" onClick={handleClick}/>
          <Button name="Load" onClick={handleOpenPopup}/>
          <Button name="Date" onClick={prependDate}/>
          <Button name={"Display (" + capFirstLetter(viewState) + ")"} onClick={handleDisplay}/>
        </div>
        <MDEditor autoFocus={true} autoFocusEnd={true} value={value} onChange={setValue} preview="edit" hideToolbar={true} height="580px" preview={viewState}/>
      </div>
      <Popup isOpen={popupOpen} onClose={handleClosePopup}>
        <p> This is a popup </p>
        <p> Peeepeeeee pooopoooo </p>
      </Popup>
    </div>
  );
}
