<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { Graph } from "@antv/x6";
import { parseMarkdownToTree } from "../utils/markdownParser";
import { DagreLayout } from "@antv/layout";
import Hierarchy from "@antv/hierarchy";
// import { marked } from 'marked'

const markdown = ref(`## 步骤
1. 准备工作  
   - 猪肉切片，加入盐、酱油、料酒、淀粉腌制。
   - 青椒切丝，姜蒜切末。
     - 1

2. 炒肉  
   - 热锅冷油，放入腌好的猪肉片炒至变色，捞出备用。

3. 炒青椒  
   - 锅中留油，爆香姜蒜末，加入青椒炒至断生。

4. 合炒 
   - 倒入炒好的肉片，调入适量盐和酱油，快速翻炒均匀。

5. 完成 
   - 出锅装盘。
   
## 123`);
const container = ref<HTMLDivElement | null>(null);
let graph: Graph | null = null;
let nodes: any[] = [];
let edges: any[] = [];
let treeDataJson: any[] = [];
console.log(Hierarchy, "Hierarchy");
// 生成随机浅色
const getRandomColor = () => {
  // 使用 HSL 颜色空间来生成浅色
  // 色相随机（0-360）
  const hue = Math.floor(Math.random() * 360);
  // 饱和度固定在30-50%之间
  const saturation = Math.floor(Math.random() * 20 + 30);
  // 亮度固定在85-95%之间，确保是浅色
  const lightness = Math.floor(Math.random() * 10 + 85);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
let color = getRandomColor();

// 递归生成node
const createNode = (orignData: any, nodes, edges, pNode = null) => {
  console.log(orignData, "orignData");

  orignData.forEach((item: any) => {
    let node = {
      id: item.id,
      label: item.content,
      isMain: item.level == 0,
      level: item.level,
      shape: "rect",
      width: item.content.length * 16,
      height: 30,
      attrs: {
        body: {
          fill: color,
          stroke: "transparent",
        },
      },
    };

    if (pNode) {
      edges.push({
        source: pNode?.id,
        target: item.id,
      });
    }
    nodes.push(node);
    if (item.children) {
      createNode(item.children, nodes, edges, node);
    }
  });
  return { nodes, edges };
};

const parseMarkdown = (md: string) => {
  let treeData = parseMarkdownToTree(md);

  let nodes: any = [];
  let edges: any = [];
  const nodeObj = createNode([treeData], nodes, edges);
  nodes = nodeObj.nodes;
  edges = nodeObj.edges;
  return { nodes, edges };
};

const initData = () => {
  const { nodes: a, edges: b } = parseMarkdown(markdown.value);
  nodes = a;
  edges = b;
  return { nodes, edges };
};

const updateGraph = () => {
  if (!graph) return;

  let treeData = parseMarkdownToTree(markdown.value);
  console.log(treeData, "ddd");
  graph.clearCells();
  initData();
  const result = Hierarchy.mindmap(treeData, {
    direction: "H",
    getHeight() {
      return 16;
    },
    getWidth() {
      return 16;
    },
    getHGap() {
      return 80;
    },
    getVGap() {
      return 1;
    },
    getSide: () => {
      return "right";
    },
  });

  const model: Model.FromJSONData = { nodes: [], edges: [] };
  const traverse = (data: HierarchyResult) => {
    if (data) {
      console.log(data, "data");
      model.nodes?.push({
        id: `${data.id}`,
        x: data.x + 250,
        y: data.y + 250,
        shape: "rect",
        label: data.data.content,
        width: data.data.content.length * 16,
        height: 16,
        attrs: {
          body: {
            fill: color,
            stroke: "transparent",
          },
        },
      });
    }
    if (data.children) {
      data.children.forEach((item: HierarchyResult) => {
        model.edges?.push({
          source: `${data.id}`,
          target: `${item.id}`,
          attrs: {
            line: {
              stroke: "#1890ff",
              strokeDasharray: 5,
              style: {
                animation: " ",
              },
            },
          },
        });
        traverse(item);
      });
    }
  };
  traverse(result);

  graph.fromJSON(model);
  // const dagreLayout = new DagreLayout({
  //     type: 'dagre',
  //     rankdir: 'TB',
  //     // 向下
  //     align: 'DL',
  //     ranksep: 35,
  //     nodesep: 15,
  //   })
  //   const model = dagreLayout.layout({
  //     nodes,
  //     edges,
  //   })

  //   graph.fromJSON(model)
};

const setPreEdge = (node: any) => {
  let inEdges = graph.getIncomingEdges(node);
  if (inEdges) {
    inEdges?.forEach((edge) => {
      // 设置边样式
      edge.attr({
        line: {
          stroke: "#1890ff",
          strokeDasharray: 5,
          targetMarker: "classic",
          style: {
            animation: "ant-line 30s infinite linear",
          },
        },
      });
    });
    const parent = inEdges[0].getSourceNode();
    if (parent) {
      setPreEdge(parent);
    }
  }
};

const setNextEdge = (node) => {
  const outEdges = graph.getOutgoingEdges(node);

  if (outEdges) {
    outEdges?.forEach((edge) => {
      // 设置边样式
      edge.attr({
        line: {
          stroke: "#1890ff",
          strokeDasharray: 5,
          targetMarker: "classic",
          style: {
            animation: "ant-line 30s infinite linear",
          },
        },
      });
    });
    outEdges?.forEach((edge) => {
      // 递归处理子节点
      const childNode = edge.getTargetNode();
      console.log(childNode, "childNode");
      if (childNode) {
        setNextEdge(childNode, true);
      }
    });
  }
};

const highlightEdges = (node) => {
  setPreEdge(node);
  setNextEdge(node);
};

onMounted(() => {
  initData();
  if (container.value) {
    graph = new Graph({
      container: container.value,
      grid: {
        visible: true,
        type: "dot",
        size: 10,
        color: "#f0f0f0",
      },
      connecting: {
        connector: "smooth",
      },
      // autoResize: true,
    });

    // 监听节点的点击事件
    graph.on("node:click", ({ node }) => {
      // 首先，取消之前高亮的边
      let nodes = graph?.getNodes();
      nodes.forEach((node) => {
        const edges = graph?.getConnectedEdges(node);
        edges.forEach((edge) => {
          // 取消高亮
          edge.attr({
            line: {
              stroke: "#1890ff",
              targetMarker: "classic",
              style: {
                animation: "ant-line1 30s infinite linear",
              },
            },
          });
        });
      });

      highlightEdges(node);
    });

    updateGraph();

    window.addEventListener("resize", () => {
      if (graph) {
        graph.resize(
          container.value!.clientWidth,
          container.value!.clientHeight
        );
        updateGraph();
      }
    });
  }
});
</script>

<template>
  <div class="app-container">
    <div class="editor">
      <h2>Markdown 输入</h2>
      <textarea
        v-model="markdown"
        @input="updateGraph"
        placeholder="输入 Markdown 格式的步骤..."
        spellcheck="false"
      ></textarea>
    </div>
    <div class="graph">
      <h2>流程图预览</h2>
      <div ref="container" class="graph-container"></div>
    </div>
  </div>
</template>

<style>
.app-container {
  display: flex;
  height: 100vh;
  padding: 20px;
  gap: 20px;
  background-color: #f0f2f5;
}

.editor,
.graph {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-width: 0;
}

h2 {
  margin-bottom: 16px;
  color: #1890ff;
  font-size: 18px;
}

textarea {
  flex: 1;
  padding: 16px;
  font-family: monospace;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
}

textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.graph-container {
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
  position: relative;
  min-height: 400px;
}

/* Override default styles */
#app {
  max-width: none;
  margin: 0;
  padding: 0;
  text-align: left;
}

body {
  margin: 0;
  padding: 0;
  background: #f0f2f5;
}
@keyframes ant-line {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>
