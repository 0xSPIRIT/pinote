// Implements: HTTP api/files GET
//
// This file returns the entire directory tree of
// the server, containing note files & subdirectories.

import {ItemType, DirectoryItem} from "@/types";
import {opendir} from "node:fs/promises";
import * as consts from "@/app/api/constants";

async function getTree(path: string): DirectoryItem[] {
  const fileStructure: DirectoryItem[] = [];

  try {
    const items = await opendir(path);

    for await (const dirent of items) {
      let item: DirectoryItem = { type: ItemType.File, name: dirent.name };

      if (dirent.isDirectory()) {
        item.type = ItemType.Directory;
        const newpath = path + "/" + item.name;
        item.children = await getTree(newpath);
      }

      fileStructure.push(item);
    }
  } catch (err) {
    console.error(err);
    return [];
  }

  return fileStructure;
}

export async function GET(request: Request) {
  const fileStructure = await getTree(consts.FILE_SYSTEM_BASE);

  return new Response(
    JSON.stringify(fileStructure),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
