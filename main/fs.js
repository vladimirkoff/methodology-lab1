'use strict';

import { readFile as fsReadFile, writeFile as fsWriteFile } from 'fs/promises';

const readFile = async (path) => {
  try { return await fsReadFile(path, 'utf-8'); } 
  catch (err) { console.error('Помилка зчитування файлу', err); }
};

const writeFile = async (path, data) => {
  try { await fsWriteFile(path, data); }
  catch (err) { console.error('Помилка запису файлу', err); }
};

export { 
  readFile,
   writeFile
   };
