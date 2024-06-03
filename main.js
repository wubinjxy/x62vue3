const jsdom = require("jsdom");
const markdownIt = require("markdown-it");
const fs = require("fs");
const path = require("path");
const md = markdownIt();

const input = fs.readFileSync(path.join(__dirname, "input.md"), "utf-8");
const html = md.render(input);
// console.log(html);
const { JSDOM } = jsdom;
 
// const html = "<h1>标题1</h1><h2>标题2</h2>";
const dom = new JSDOM(html);
 
function getVirtualDom(element) {
  let result = {
    tag: element.tagName.toLowerCase(),
    children: []
  };
 
  for (let i = 0; i < element.childNodes.length; i++) {
    let child = element.childNodes[i];
    if (child.nodeType === 1) { // Element
      result.children.push(getVirtualDom(child));
    } else if (child.nodeType === 3) { // Text
      result.children.push(child.nodeValue.trim());
    }
  }
 
  if (result.children.length === 1) {
    result.text = result.children[0];
    result.children = [];
  } else if (result.children.length === 0) {
    result.text = '';
  }
 
  return result;
}
 
const virtualDom = getVirtualDom(dom.window.document.body);
console.log(virtualDom);