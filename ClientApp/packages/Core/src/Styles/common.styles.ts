import { createStyles, Theme } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { CellStyle, RowStyle } from 'ag-grid-community';

export const flexRow = (theme: Theme): CSSProperties => {
  return {
    display: 'flex',
    flexDirection: 'row',
  };
};

export const flexColumn = (theme: Theme): CSSProperties => {
  return {
    display: 'flex',
    flexDirection: 'column',
  };
};

// used in ag grid actions
export const cellStyle = (): CellStyle => {
  return {
    paddingLeft: 0,
    lineHeight: 0,
    border: 'none',
  };
};

export const rowStyle = (isRowEditing: boolean, isEditable: boolean): RowStyle => {
  if (!isEditable) {
    return { cursor: 'default' };
  }
  if (!isRowEditing) {
    return null;
  }
  return { opacity: '0.7', filter: 'grayscale(1)', pointerEvents: 'none' };
};
// styles for dialog with custom Ag grid
export const gridDialogStyles = (theme: Theme) =>
  createStyles({
    paperSize: {
      width: '800px',
      height: '80vh',
    },
  });
