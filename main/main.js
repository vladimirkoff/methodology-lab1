'use strict';

import path from "node:path";
import { readFile, writeFile } from "./fs.js";
import { transform } from "./transformer.js";

const pDir = '..'
const out = '--out'
const format = '--format'
const separator = '='

const processMarkdown = async (args) => {
  const argv = parseArguments(args.slice(2));
  const filePath = argv.in;
  const fileFormat = argv.format;

  if (!filePath) {
    console.error('Please provide a file path.');
    return;
  }

  const url = new URL(import.meta.url);
  const dir = path.dirname(url.pathname);
  const parentDir = path.join(dir, pDir);
  const absolutePath = path.join(parentDir, filePath[0]);
  const data = await readFile(absolutePath);
  const html = transform(data, fileFormat);

  if (argv.out) {
    const outPath = path.join(parentDir, argv.out);
    await writeFile(outPath, html);
  } else {
    console.log(html);
  }
};

const parseArguments = (args) => {
  const argv = {
    in: args.shift(),
    out: '',
    format: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === out) {
      i++
      argv.out = args[i];
      if (argv.out === undefined) {
        console.error('Please provide a file path for the output.');
        process.exit(1);
      }
    } else if (arg.startsWith(format)) {
      argv.format = arg.split(separator)[1];
    }
  }

  return argv;
};

processMarkdown(process.argv);


