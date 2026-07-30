import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "dist");
const serverDir = path.join(outputDir, "server");
const staticFiles = ["index.html", "admin.html"];
const staticDirs = ["data", "concepts"];

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8"
};

async function collectDirectory(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectDirectory(absolute, relative));
    } else if (entry.isFile()) {
      files.push({ absolute, relative });
    }
  }
  return files;
}

const files = staticFiles.map(relative => ({
  absolute: path.join(root, relative),
  relative
}));
for (const directory of staticDirs) {
  files.push(...await collectDirectory(path.join(root, directory), directory));
}

const payload = {};
for (const file of files) {
  const extension = path.extname(file.relative).toLowerCase();
  const body = await readFile(file.absolute);
  payload["/" + file.relative.split(path.sep).join("/")] = {
    contentType: contentTypes[extension] || "application/octet-stream",
    body: body.toString("base64")
  };
}

const workerSource = `const FILES=${JSON.stringify(payload)};

function decodeBase64(value){
  const binary=atob(value);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
}

const worker={
  async fetch(request){
    const url=new URL(request.url);
    let pathname;
    try{pathname=decodeURIComponent(url.pathname);}catch{return new Response("Bad Request",{status:400});}
    if(pathname==="/")pathname="/index.html";
    const file=FILES[pathname];
    if(!file)return new Response("Not Found",{status:404});
    const headers={
      "content-type":file.contentType,
      "x-content-type-options":"nosniff",
      "cache-control":file.contentType.startsWith("text/html")?"no-cache":"public, max-age=300"
    };
    if(request.method==="HEAD")return new Response(null,{status:200,headers});
    if(request.method!=="GET")return new Response("Method Not Allowed",{status:405,headers:{allow:"GET, HEAD"}});
    return new Response(decodeBase64(file.body),{status:200,headers});
  }
};

export default worker;
`;

await rm(outputDir, { recursive: true, force: true });
await mkdir(serverDir, { recursive: true });
await writeFile(path.join(serverDir, "index.js"), workerSource, "utf8");

console.log(`Built ${files.length} static files for Sites.`);
