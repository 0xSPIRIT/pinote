import { useState, useEffect } from "react";
import Button from "../components/Button";
import * as utils from "../util/util";

enum ItemType {
  Directory,
  File
};

type DirectoryItem = {
  type: ItemType;
  name: string;
  children?: DirectoryItem[];
  count: number;
};

function InputArea({onChange, keyDownHandler, className}) {
  const styling = "outline outline-gray-800 rounded-full bg-gray-900 px-3 font-mono " + className;

  return (
    <input onKeyDown={keyDownHandler} className={styling} type="text" onChange={onChange} placeholder="Enter search filter..."/>
  );
}

function DialogItem({item, index, isSelected, onHover, onClick}) {
  let styling = "font-mono outline outline-gray-700 cursor-pointer rounded-full px-3 py-0.5";

  const isDirectory = (item.type == ItemType.Directory);

  if (isDirectory) {
    if (item.children) {
      styling += " text-blue-300 bold";
    } else {
      styling += " text-gray-500 bold";
    }
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
  if (search.length == 0)
    return tree;

  console.log("----\nsearch string: " + search);

  let result: DirectoryItem[] = [];

  for (let i = 0; i < tree.length; i++) {
    const count = utils.substringElements(tree[i].name, search);
    console.log(tree[i].name + ": " + count);

    tree[i].count = count;

    if (count > 0) {
      result.push(tree[i]);
    }
  }

  result.sort((a, b) => b.count - a.count);

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

export default function FileDialog() {
  // Dummy file structure for now -- replace with actual file structure from server directory
  const fileStructure: DirectoryItem[] = [
    {
      type: ItemType.Directory,
      name: "old",
      children: [
        {
          type: ItemType.Directory,
          name: "subdir",
          children: [
            { type: ItemType.File, name: "first.md" },
            { type: ItemType.File, name: "second.md" },
          ]
        },
        { type: ItemType.File, name: "hello.md" },
        { type: ItemType.File, name: "hello1.md" },
        { type: ItemType.File, name: "hello2.md" },
        { type: ItemType.File, name: "hello3.md" },
      ]
    },
    { type: ItemType.Directory, name: "ontario" },
    { type: ItemType.Directory, name: "other notes" },
    { type: ItemType.File, name: "main.md" },
    { type: ItemType.File, name: "second.md" },
    { type: ItemType.File, name: "third.md" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState(fileStructure);
  const [currentTree, setCurrentTree] = useState(fileStructure);
  const [currentDir, setCurrentDir] = useState("");

  const updateSearchQuery = event => {
    setSearchQuery(event.target.value);
    setFilteredItems(filterItems(currentTree, event.target.value));
    setSelectedIndex(0);
  }

  useEffect(() => setFilteredItems(filterItems(currentTree, searchQuery)), [currentTree]);

  //useEffect(() => console.log(filteredItems), [filteredItems]);

  const onItemHover = event => setSelectedIndex(Number(event.target.id));

  const selectItem = () => {
    let item = filteredItems[selectedIndex];

    if (item.type == ItemType.Directory) {
      let newDir = currentDir;

      if (item.name == "..") {
        let idx = newDir.lastIndexOf("/");

        if (idx == -1)
          newDir = "";
        else
          newDir = newDir.substring(0, idx);
      } else {
        newDir = newDir + "/" + item.name;
      }

      setCurrentDir(newDir);

      if (newDir == "") {
        setCurrentTree(fileStructure);
      } else {
        setCurrentTree(getDirectoryFromPath(newDir, fileStructure));
      }

      setSelectedIndex(0);
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
    <div className="relative w-1/2 grid gap-2 outline outline-gray-800 rounded-lg bg-black px-4 py-3 mx-auto">
      <div className="flex justify-center">
        <div className="flex items-center w-full max-w-2xl gap-4">
          <h1 className="font-extrabold text-gray-500 whitespace-nowrap">File Picker</h1>
          <InputArea className="flex-grow" onChange={updateSearchQuery} keyDownHandler={keyPressHandler} />
          <Button name="New Folder" className="font-mono text-[13px]" />
          <Button name="New File" className="font-mono text-[13px]" />
        </div>
      </div>

      <ItemList
        items={filteredItems}
        onItemHover={onItemHover}
        onClick={onItemClick}
        selectedIndex={selectedIndex}
      />
    </div>
  )
}
