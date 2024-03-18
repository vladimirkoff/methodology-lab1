'use strict';

import path from "node:path";
import { readFile, writeFile } from "./fs.js";
import { transform } from "./transformer.js";

const pDir = '..'
const out = '--out'

const processMarkdown = async (filePath) => {
  const url = new URL(import.meta.url);
  const dir = path.dirname(url.pathname);
  const parentDir = path.join(dir, pDir);
  const absolutePath = path.join(parentDir, filePath[2]);
  const data = await readFile(absolutePath);
  const html = transform(data);

  if (filePath.find(item => item === out))
  { const outPath = path.join(parentDir,filePath[4]); await writeFile(outPath, html) }
  else { console.log(html) }
};

processMarkdown(process.argv)
