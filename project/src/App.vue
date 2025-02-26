<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Graph } from '@antv/x6'
import { parseMarkdownToTree } from './utils/markdownParser'
// import { marked } from 'marked'

const markdown = ref(`## 步骤`)
const container = ref<HTMLDivElement | null>(null)
let graph: Graph | null = null


// 递归生成node
const createNode = (orignData: any,nodes,edges,pNode=null) => {
  console.log(orignData)
  
  orignData.forEach((item:any) => {
    let node = {
      id: item.id,
      label: item.content,
      isMain: item.level==0,
      level:item.level
      // subNodes: item.subNodes
    }
    
    console.log(pNode)
    if(pNode){
      edges.push({
        source: pNode?.id,
        target: item.id
      })
    }
    nodes.push(node)
    if(item.children){
       createNode(item.children,nodes,edges,node)
    }
  })
  return {nodes,edges}
}

const parseMarkdown = (md: string) => {
  let treeData = parseMarkdownToTree(md)
  let nodes:any = []
  let edges:any = []
  const nodeObj = createNode([treeData],nodes,edges)
  nodes = nodeObj.nodes
  edges = nodeObj.edges
  console.log(nodeObj)
  return { nodes, edges }


  // console.log(md)
  // const lines = md.split('\n')
  
  // let currentMainNode: string | null = null
  // let lastNodeId = 0
  // let subNodeCount = 0

  // const createNodeId = () => `node-${++lastNodeId}`

  // lines.forEach((line) => {
  //   console.log(line) 
  //   const mainStepMatch = line.match(/^\d+\.\s+\*\*([^*]+)\*\*/)
  //   const subStepMatch = line.match(/^\s*-\s+(.+)/)

  //   if (mainStepMatch) {
  //     subNodeCount = 0 // Reset sub-node counter for new main node
  //     const nodeId = createNodeId()
  //     const label = mainStepMatch[1].trim()
  //     nodes.push({
  //       id: nodeId,
  //       label,
  //       isMain: true,
  //       subNodes: 0
  //     })

  //     if (nodes.length > 1) {
  //       const prevMainNode = nodes.find(n => n.isMain)?.id
  //       if (prevMainNode && prevMainNode !== nodeId) {
  //         edges.push({
  //           source: prevMainNode,
  //           target: nodeId
  //         })
  //       }
  //     }
  //     currentMainNode = nodeId
  //   } else if (subStepMatch && currentMainNode) {
  //     const nodeId = createNodeId()
  //     const label = subStepMatch[1].trim()
  //     nodes.push({
  //       id: nodeId,
  //       label,
  //       isMain: false,
  //       subNodeIndex: subNodeCount++
  //     })

  //     // Update the main node's sub-node count
  //     const mainNode = nodes.find(n => n.id === currentMainNode)
  //     if (mainNode) {
  //       mainNode.subNodes = (mainNode.subNodes || 0) + 1
  //     }

  //     edges.push({
  //       source: currentMainNode,
  //       target: nodeId
  //     })
  //   }
  // })
  // console.log(nodes, edges )
  // return { nodes, edges }
}

const updateGraph = () => {
  if (!graph) return
  
  graph.clearCells()
  const { nodes, edges } = parseMarkdown(markdown.value)
  
  // Layout configuration
  const startY = 50
  const mainNodeGap = 250 // Increased vertical gap between main nodes
  const subNodeHorizontalGap = 200 // Horizontal distance from main node to sub-nodes
  const subNodeVerticalGap = 100 // Vertical gap between sub-nodes
  
  let currentY = startY+100
  let lastMainNodeId = null

  // First pass: Create all nodes
  nodes.forEach((node: any,index) => {
    if (node.isMain) {
      // Main node positioning
      const nodeConfig = {
        id: node.id,
        shape: 'rect',
        width: 100,
        height: 60,
        position: {
          x: 50,
          y: currentY
        },
        label: node.label,
        attrs: {
          body: {
            fill: '#e6f7ff',
            stroke: '#1890ff',
            strokeWidth: 2,
            rx: 8,
            ry: 8,
          },
          label: {
            fill: '#333',
            fontSize: 14,
            fontWeight: 'bold',
            textWrap: {
              width: -20,
              height: -20,
              ellipsis: true
            }
          },
        },
      }
      graph?.addNode(nodeConfig)
      
      // Update for next main node
      currentY += mainNodeGap
      lastMainNodeId = node.id
    } else {
      // Sub-node positioning
      const parentNode = nodes.find(n => n.id === edges.find(e => e.target === node.id)?.source)
      if (!parentNode) return
      const parentY = graph?.getCellById(parentNode.id).position().y
      const subNodeY =((node.level + index) * subNodeVerticalGap) - 
                      ((parentNode.level * subNodeVerticalGap) / 2)
      const subNodeX =  subNodeHorizontalGap*(node.level-1)

      console.log(parentY,'parentY',subNodeY)


      const nodeConfig = {
        id: node.id,
        shape: 'rect',
        width: 150,
        height: 50,
        position: {
          x: subNodeX,
          y: subNodeY
        },
        label: node.label,
        attrs: {
          body: {
            fill: '#fff',
            stroke: '#91d5ff',
            strokeWidth: 2,
            rx: 8,
            ry: 8,
          },
          label: {
            fill: '#333',
            fontSize: 12,
            textWrap: {
              width: -20,
              height: -20,
              ellipsis: true
            }
          },
        },
      }
      graph?.addNode(nodeConfig)
    }
  })

  // Second pass: Create edges with improved routing
  edges.forEach((edge) => {
    graph?.addEdge({
      source: edge.source,
      target: edge.target,
      attrs: {
        line: {
          stroke: '#91d5ff',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            size: 8,
          },
        },
      },
      router: {
        name: 'manhattan',
        args: {
          padding: 20,
          startDirections: ['right'],
          endDirections: ['left'],
        },
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
    })
  })

  // Adjust the view to fit all content
  const padding = 40
  const contentArea = graph.getContentArea()
  const graphWidth = Math.max(graph.container.clientWidth, contentArea.width + padding * 2)
  const graphHeight = Math.max(graph.container.clientHeight, contentArea.height + padding * 2)
  
  graph.resize(graphWidth, graphHeight)
  graph.centerContent()
  
  // Calculate and apply scale if needed
  const scaleX = (graph.container.clientWidth - padding * 2) / contentArea.width
  const scaleY = (graph.container.clientHeight - padding * 2) / contentArea.height
  const scale = Math.min(scaleX, scaleY, 1)
  
  if (scale < 1) {
    graph.scale(scale)
    graph.centerContent()
  }
}

// watch(markdown, () => {
//   requestAnimationFrame(() => {
//     updateGraph()
//   })
// }, { immediate: true })

onMounted(() => {
  if (container.value) {
    graph = new Graph({
      container: container.value,
      grid: {
        visible: true,
        type: 'dot',
        size: 10,
        color: '#f0f0f0',
      },
      autoResize: true,
      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: false,
        highlight: true,
      },
      interacting: {
        nodeMovable: true,
        edgeMovable: true,
      },
      scaling: {
        min: 0.2,
        max: 1.5,
      },
      panning: true,
    })
    
    updateGraph()

    window.addEventListener('resize', () => {
      if (graph) {
        graph.resize(container.value!.clientWidth, container.value!.clientHeight)
        updateGraph()
      }
    })
  }
})
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

.editor, .graph {
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
</style>