import { useState, useEffect } from "react";
import Button from "../components/Button";
import * as utils from "../util/util";
import {ItemType, DirectoryItem} from "@/types";

function InputArea({value, onChange, keyDownHandler, className}) {
  const styling = "outline outline-gray-800 rounded-full bg-gray-900 px-3 font-mono " + className;

  return (
    <input
      value={value}
      onKeyDown={keyDownHandler}
      className={styling}
      type="text"
      onChange={onChange}
      placeholder="Enter search filter..."
    />
  );
}

function DialogItem({item, index, isSelected, onHover, onClick}) {
  let styling = "font-mono outline outline-gray-700 cursor-pointer rounded-full px-3 py-0.5";

  const isDirectory = (item.type == ItemType.Directory);

  if (isDirectory) {
    if (item.children) {
      styling += " text-red-100 font-semibold";
    } else {
      styling += " text-gray-500";
    }
  } else {
    styling += " text-blue-100 font-semibold";
  }

  if (isSelected) {
    styling += " bg-gray-800";
  } else {
    styling += " bg-gray-900";
  }

  return (
    <li className={styling} id={index} onClick={onClick} onMouseEnter={onHover}> {item.name}{isDirectory && "/"} </li>
  );
}

function filterItems(tree: DirectoryItem[], search: string): DirectoryItem[] {
  if (!search || search.length === 0)
    return tree;

  let result: DirectoryItem[] = [];

  let isTopLevel = true;

  for (const item of tree) {
    if (item.name === "..") {
      isTopLevel = false;
      continue; // we add this guy after
    }

    const count = utils.substringElements(item.name, search);

    item.count = count;

    if (count > 0) {
      result.push(item);
    }
  }

  result.sort((a, b) => b.count - a.count);

  if (!isTopLevel) {
    const prev: DirectoryItem = { type: ItemType.Directory, name: ".." };

    if (result.length > 0)
      result = [prev, ...result];
    else
      result = [prev]
  }

  return result;
}

function getDirectoryFromPath(path: string, dir: DirectoryItem[]): DirectoryItem[] {
  if (path.length === 0 || path === "/") {
    const prev: DirectoryItem = { type: ItemType.Directory, name: ".." };
    if (dir.length > 0)
      return [prev, ...dir];
    else
      return [prev];
  }

  let result = dir;
  let remainingPath = path.startsWith("/") ? path.slice(1) : path;

  const firstIndex = remainingPath.indexOf('/');
  const first = firstIndex === -1 ? remainingPath : remainingPath.substring(0, firstIndex);
  const rest = firstIndex === -1 ? "" : remainingPath.substring(firstIndex + 1);

  // Find the matching directory
  for (const item of result) {
    if (item.type === ItemType.Directory && item.name === first) {
      // Recurse into subdirectory
      return getDirectoryFromPath(rest, item.children || []);
    }
  }

  // Shouldn't ever get here with valid path.
  assert(false);
  return dir;
}

function ItemList({items, onItemHover, onClick, selectedIndex}) {
  if (items.length == 0)
    return null;

  const listItems = items.map(
    (item, idx) => <DialogItem isSelected={idx == selectedIndex} onHover={onItemHover} onClick={onClick} item={item} key={idx} index={idx}/>
  );

  return (
    <ul> {listItems} </ul>
  );
}

export default function FileDialog({setClose, selectFile, setFileData, saveFile}) {
  const [searchQuery,   setSearchQuery]   = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentTree,   setCurrentTree]   = useState([]);
  const [fileStructure, setFileStructure] = useState([]);
  const [currentDir,    setCurrentDir]    = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/files")
    .then(res => res.json())
    .then(data => {
      setFileStructure(data);
      setFilteredItems(data);
      setCurrentTree(data);
    });
  }, []);

  useEffect(() => setFilteredItems(filterItems(currentTree, searchQuery)), [currentTree]);

  const onItemHover = event => setSelectedIndex(Number(event.target.id));

  const updateSearchQuery = event => {
    setSearchQuery(event.target.value);
    const items = filterItems(currentTree, event.target.value);
    setFilteredItems(items);

    const a = items[0].name === ".." ? 1 : 0;
    setSelectedIndex(a);
  }

  const selectItem = () => {
    let item = filteredItems[selectedIndex];

    if (item.type == ItemType.Directory) {
      setSearchQuery("");

      let newDir = currentDir;

      if (item.name == "..") {
        const idx = newDir.lastIndexOf("/");

        if (idx == -1)
          newDir = "";
        else
          newDir = newDir.substring(0, idx);
      } else {
        if (newDir !== "")
          newDir += "/";

        newDir += item.name;
      }

      setCurrentDir(newDir);

      if (newDir == "") {
        setCurrentTree(fileStructure);
      } else {
        setCurrentTree(getDirectoryFromPath(newDir, fileStructure));
      }

      setSelectedIndex(filteredItems[0].name === ".." ? 1 : 0);
    } else if (item.type == ItemType.File) {
      saveFile();

      let filepath = currentDir;

      if (filepath !== "")
        filepath += "/";

      filepath += item.name;

      selectFile(filepath); // set the filepath in page.tsx
      setClose();

      // Request and the note data itself
      utils.readFileFromServer(filepath).then(data => setFileData(data));
    }
  };

  const keyPressHandler = event => {
    const count = filteredItems.length;

    switch (event.key) {
      case "ArrowUp": {
        setSelectedIndex(a => (a - 1 + count) % count);
        break;
      }
      case "ArrowDown": {
        setSelectedIndex(a => (a + 1 + count) % count);
        break;
      }
      case "Enter": {
        selectItem();
        break;
      }
    }
  };

  const onItemClick = event => selectItem();

  return (
    <div className="flex gap-10">
      <div className="relative w-1/2 grid gap-2 outline outline-gray-800 rounded-lg bg-black px-4 py-3">
        <div className="flex justify-center">
          <div className="flex items-center w-full max-w-2xl gap-4">
            <h1 className="font-extrabold text-gray-500 whitespace-nowrap">File Picker</h1>
            <InputArea value={searchQuery} className="flex-grow" onChange={updateSearchQuery} keyDownHandler={keyPressHandler}/>
            <Button name="New Folder" className="font-mono text-[13px]" />
            <Button name="New File" className="font-mono text-[13px]" />
            <Button name="Close" className="font-mono text-[13px]" onClick={setClose} />
          </div>
        </div>

        <ItemList
          items={filteredItems}
          onItemHover={onItemHover}
          onClick={onItemClick}
          selectedIndex={selectedIndex}
        />
      </div>
      <div className="outline outline-gray-800 rounded-lg bg-black px-4 py-3">
        <h1 className="font-extrabold text-gray-500 whitespace-nowrap">Preview</h1>
      </div>
    </div>
  )
}
