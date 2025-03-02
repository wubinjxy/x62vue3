<template>
  <!-- FlowChart  为三列布局。左侧是可操作的组件。中间是流程图展示面板。右侧为属性面板。 大小为 25% 50% 25% css用taildwindcss    -->
  <div class="flex h-full">
    <div ref="stencilContainer" class="relative w-[200px] h-[100vh]"></div>
    <div style="width: 100%; height: 100%" class="flex-1 w-[80%] !h-[100vh]">
      <div ref="container"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { Graph } from "@antv/x6";
import { Snapline } from "@antv/x6-plugin-snapline";
import { Stencil } from "@antv/x6-plugin-stencil";
const container = ref(null);
const stencilContainer = ref(null);
let graph: Graph | null = null;
const commonAttrs = {
  body: {
    fill: "#fff",
    stroke: "#8f8f8f",
    strokeWidth: 1,
  },
};

const init = () => {
  graph = new Graph({
    container: container.value,
    autoResize: true,
    panning: true,
    mousewheel: true,
    background: {
      color: "#F2F7FA",
    },
    grid: {
      visible: true,
      type: "doubleMesh",
      args: [
        {
          color: "#eee", // 主网格线颜色
          thickness: 1, // 主网格线宽度
        },
        {
          color: "#ddd", // 次网格线颜色
          thickness: 1, // 次网格线宽度
          factor: 4, // 主次网格线间隔
        },
      ],
    },
  });

  // 插件 snapline
  graph.use(
    new Snapline({
      enabled: true,
      sharp: true,
    })
  );
};

const initStencil = () => {
  const stencil = new Stencil({
    title: "工具栏",
    target: graph,
    search(cell, keyword) {
      return cell.shape.indexOf(keyword) !== -1;
    },
    placeholder: "搜索",
    notFoundText: "没有这图形",
    collapsable: true,
    stencilGraphHeight: 0,
    groups: [
      {
        name: "group1",
        title: "图形1",
      },
      {
        name: "group2",
        title: "图形2",
        collapsable: false,
      },
    ],
  });

  stencilContainer.value.appendChild(stencil.container);

  const n1 = graph.createNode({
    shape: "rect",
    x: 40,
    y: 40,
    width: 80,
    height: 40,
    label: "rect",
    attrs: commonAttrs,
  });

  const n2 = graph.createNode({
    shape: "circle",
    x: 180,
    y: 40,
    width: 40,
    height: 40,
    label: "circle",
    attrs: commonAttrs,
  });

  const n3 = graph.createNode({
    shape: "ellipse",
    x: 280,
    y: 40,
    width: 80,
    height: 40,
    label: "ellipse",
    attrs: commonAttrs,
  });

  const n4 = graph.createNode({
    shape: "path",
    x: 420,
    y: 40,
    width: 40,
    height: 40,
    // https://www.svgrepo.com/svg/13653/like
    path: "M24.85,10.126c2.018-4.783,6.628-8.125,11.99-8.125c7.223,0,12.425,6.179,13.079,13.543c0,0,0.353,1.828-0.424,5.119c-1.058,4.482-3.545,8.464-6.898,11.503L24.85,48L7.402,32.165c-3.353-3.038-5.84-7.021-6.898-11.503c-0.777-3.291-0.424-5.119-0.424-5.119C0.734,8.179,5.936,2,13.159,2C18.522,2,22.832,5.343,24.85,10.126z",
    attrs: commonAttrs,
    label: "path",
  });

  stencil.load([n1, n2], "group1");
  stencil.load([n3, n4], "group2");
};

onMounted(() => {
  init();
  initStencil();
});
</script>

<style>
</style>