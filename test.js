function parseNestedList(text, level = 0) {
    // 将文本按行分割
    const lines = text.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 检查是否是列表项
        if (line.trim().startsWith('-')) {
            // 获取当前行的缩进级别
            const currentIndent = line.search(/\S/);
            const content = line.trim().substring(2);
            
            const item = {
                content: content,
                children: []
            };
            
            // 查找子项
            let j = i + 1;
            while (j < lines.length) {
                const nextLine = lines[j];
                const nextIndent = nextLine.search(/\S/);
                
                // 如果下一行缩进更多，说明是子项
                if (nextIndent > currentIndent && nextLine.trim().startsWith('-')) {
                    // 收集所有子项的文本
                    let childText = '';
                    while (j < lines.length) {
                        const childLine = lines[j];
                        const childIndent = childLine.search(/\S/);
                        if (childIndent <= currentIndent) break;
                        childText += childLine + '\n';
                        j++;
                    }
                    // 递归处理子项
                    item.children = parseNestedList(childText, level + 1);
                    i = j - 1;
                    break;
                }
                j++;
            }
            
            result.push(item);
        }
    }
    
    return result;
}

// 使用示例
const testText = `
- 猪肉切片，加入盐、酱油、料酒、淀粉腌制。
- 青椒切丝，姜蒜切末。
  - 1
`;

console.log(JSON.stringify(parseNestedList(testText), null, 2));
