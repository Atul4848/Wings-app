import { useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';

export function useAgGridMock() {
  const gridState = useGridState();
  const agGrid = useAgGrid([], gridState);
  return {
    ...agGrid,
    gridState,
    cancelEditing: () => {
      console.log('Cancel Editing Called');
    },
  };
}
