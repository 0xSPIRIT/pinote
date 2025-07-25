'use client';

import Button from "../components/Button";
import FileDialog from "../components/FileDialog";
import * as utils from "../util/util";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";

import * as commands from "@uiw/react-md-editor/commands"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

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

  const prependDate = () => setValue("*" + utils.getDateTime() + "*" + "\n\n" + value);

  return (
    <div>
      <div className="flex flex-col gap-4 p-4">
        <FileDialog/>
        <div className="flex gap-2">
          <Button name="New" onClick={handleClick}/>
          <Button name="Save" onClick={handleClick}/>
          <Button name="Load" onClick={handleOpenPopup}/>
          <Button name="Date" onClick={prependDate}/>
          <Button name={"Display (" + utils.capFirstLetter(viewState) + ")"} onClick={handleDisplay}/>
        </div>
        <MDEditor autoFocus={true} autoFocusEnd={true} value={value} onChange={setValue} preview="edit" hideToolbar={true} height="580px" preview={viewState}/>
      </div>
    </div>
  );
}
