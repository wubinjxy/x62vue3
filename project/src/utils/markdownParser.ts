import { marked } from 'marked';

export interface TreeNode {
  id: string;
  type: string;
  content: string;
  level: number;
  children: TreeNode[];
}

export function parseMarkdownToTree(markdown: string): TreeNode {
  const tokens = marked.lexer(markdown);
  const root: TreeNode = {
    id: 'root',
    type: 'root',
    content: 'Root',
    level: 0,
    children: [],
  };

  let currentNode = root;
  let currentLevel = 0;
  let nodeStack = [root];
  let idCounter = 1;

  function processListItems(items: marked.Token[], parentNode: TreeNode, baseLevel: number) {
    items.forEach(item => {
      if ('tokens' in item) {
        const text = item.tokens
          .map(token => ('text' in token ? token.text : ''))
          .join(' ')
          .trim();

        const newNode: TreeNode = {
          id: `node-${idCounter++}`,
          type: 'list-item',
          content: text,
          level: baseLevel + 1,
          children: [],
        };

        parentNode.children.push(newNode);

        // Process nested lists if they exist
        const nestedList = item.tokens.find(token => 
          token.type === 'list'
        ) as marked.Tokens.List | undefined;

        if (nestedList) {
          processListItems(nestedList.items, newNode, baseLevel + 1);
        }
      }
    });
  }

  tokens.forEach((token) => {
    if (token.type === 'heading') {
      const level = token.depth;
      const newNode: TreeNode = {
        id: `node-${idCounter++}`,
        type: 'heading',
        content: token.text,
        level: level,
        children: [],
      };

      while (currentLevel >= level && nodeStack.length > 1) {
        nodeStack.pop();
        currentLevel--;
      }

      currentNode = nodeStack[nodeStack.length - 1];
      currentNode.children.push(newNode);
      nodeStack.push(newNode);
      currentLevel = level;

    } else if (token.type === 'list') {
      const currentParent = nodeStack[nodeStack.length - 1];
      processListItems(token.items, currentParent, currentLevel);
    }
  });

  return root;
}