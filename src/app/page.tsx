'use client';

import Button from "../components/Button";
import FileDialog from "../components/FileDialog";
import * as utils from "../util/util";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

import * as commands from "@uiw/react-md-editor/commands"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

export default function Home() {
  const [value, setValue] = useState("");
  const [viewState, setViewState] = useState("live");
  const [popupOpen, setPopupOpen] = useState(true);
  const [filename, setFilename] = useState("fourth.md");

  useEffect(() => {
    utils.readFileFromServer(filename).then(data => setValue(data));
  }, []);

  const handleClick = () => alert("Button click");

  const handleOpenPopup = () => setPopupOpen(true);
  const handleClosePopup = () => setPopupOpen(false);

  const selectFile = fp => setFilename(fp);

  const saveFile = () => {
    async function save() {
      await utils.saveFileToServer(filename, value);
    }
    save();
  };

  const handleDisplay = () => {
    switch (viewState) {
      case "edit":    { setViewState("live");    break; }
      case "live":    { setViewState("preview"); break; }
      case "preview": { setViewState("edit");    break; }
    }
  };

  const prependDate = () => setValue("*" + utils.getDateTime() + "*" + "\n\n" + value);

  return (
    <div className="flex flex-col gap-4 p-4">
      {popupOpen && <FileDialog setClose={handleClosePopup} selectFile={selectFile} setFileData={setValue} saveFile={saveFile}/>}

      <div className="flex gap-2">
        <h1 className="font-extrabold text-gray-500"> {filename} </h1>
        <Button name="New" onClick={handleClick}/>
        <Button name="Save" onClick={saveFile}/>
        <Button name="Load" onClick={handleOpenPopup}/>
        <Button name="Date" onClick={prependDate}/>
        <Button name={"Display (" + utils.capFirstLetter(viewState) + ")"} onClick={handleDisplay}/>
      </div>
      <MDEditor autoFocus={true} autoFocusEnd={true} value={value} onChange={setValue} hideToolbar={true} height="580px" preview={viewState}/>
    </div>
  );
}
