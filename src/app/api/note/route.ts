// This file reads and writes to/from notes on the
// server's file system.
//
// Implements: HTTP api/note?query=... GET  (read)
// Implements: HTTP api/note           POST (write)
//
// The filepath is relative to inside of
// consts.FILE_SYSTEM_BASE.

import * as consts from "@/app/api/constants";
import * as fs from "fs";
import NextRequest from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  const filepath = consts.FILE_SYSTEM_BASE + "/" + query;

  const fileData = fs.readFileSync(filepath, "utf8");

  return new Response(
    JSON.stringify({ result: fileData }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  const relativePath = body.filepath;
  const data = body.data;

  const fp = consts.FILE_SYSTEM_BASE + "/" + relativePath;

  fs.writeFileSync(fp, data);

  return Response.json({ body });
}
