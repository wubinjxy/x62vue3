import { Graph, Cell } from '@antv/x6';

declare module '@antv/x6' {
  interface Graph {
    enableRubberband(): void;
    disableRubberband(): void;
    enableConnecting(options: any): void;
    disableConnecting(): void;
    getSelectedCells(): Cell[];
    bindKey(keys: string[], callback: () => void): void;
  }

  interface GraphOptions {
    selecting?: {
      enabled?: boolean;
      multiple?: boolean;
      rubberband?: boolean;
      showNodeSelectionBox?: boolean;
    };
    keyboard?: boolean;
    clipboard?: boolean;
    history?: boolean;
  }
} 