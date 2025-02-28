import fs from 'fs';
import path from 'path';
import {parseMarkdownToTree} from './project/src/utils/markdownParser.js';
let mdFile = path.join('./input.md');

// 获取md文件内容
let mdContent = fs.readFileSync(mdFile, 'utf-8');
let result = parseMarkdownToTree(mdContent);
console.log(result);