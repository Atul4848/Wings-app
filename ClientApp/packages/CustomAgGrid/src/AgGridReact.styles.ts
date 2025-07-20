import { createStyles } from '@material-ui/core/styles';
import { ITheme } from '@wings-shared/core';

export const styles = ({ palette, spacing }: ITheme) => {
  const table = palette.table as any;
  return createStyles({
    gridContainer: {
      height: '85%',
      width: '100%',
      '& div.MuiSelect-select': {
        border: '1px solid #CBCDD5',
        borderRadius: 3,
      },
      '& div.ag-root-wrapper': {
        border: 'none',
        borderRadius: spacing(0.75),
      },
      '& div.ag-header': {
        borderBottom: 'none',
        background: '#5F5F5F',
        fontSize: '12px',
        lineHeight: '19px',
      },
      '& div.ag-header-row': {
        color: palette.primary.contrastText,
      },
      '& div.ag-text-field-input-wrapper': {
        color: palette.primary.main,
      },
      '& span.ag-header-icon': {
        color: palette.primary.contrastText,
      },
      '& span .ag-icon.ag-icon-tree-closed': {
        // color: palette.table?.even.textColor,
      },
      '& span .ag-icon.ag-icon-tree-open': {
        // color: palette.table?.even.textColor,
      },
      '& div.ag-row': {
        color: palette.text.primary,
        background: palette.background.paper,
        fontSize: '13px',
        cursor: 'pointer',
        borderColor: palette.divider,
      },
      '& div.ag-row-editing': {
        cursor: 'default',

        '& .ag-cell:focus:not(.ag-cell-range-selected)': {
          borderColor: 'transparent',
        },
      },
      '& div.ag-row-editing.ag-row-hover': {
        background: palette.background.paper,
      },
      '& div.ag-row-odd': {
        background: table?.row.backgroundColor.hovered,
        // color: table.row.textColor.default,
      },
      '& div.ag-row-even': {
        // background: palette.table?.even.backgroundColor,
        // color: palette.table?.even.textColor,
      },
      '& div.ag-body-viewport::-webkit-scrollbar': {
        width: 8,
      },
      '& div.ag-body-viewport::-webkit-scrollbar-thumb': {
        borderRadius: 10,
        backgroundColor: '#D9D9D9',
      },
      '& div.ag-cell': {
        display: 'flex',
        alignItems: 'center',
        color: palette.grey.A700,
      },
      '& div.ag-row-hover': {
        // background: palette.table?.hover.backgroundColor,
      },
      '& div.ag-row-selected': {
        background: palette.grey['900'],
      },
      '& div.ag-paging-panel': {
        background: palette.background.paper,
        color: palette.text.primary,
      },
      '& div .ag-cell-inline-editing': {
        lineHeight: 'unset',
        background: palette.background.paper,
        height: '100%',
        '& .Mui-disabled': {
          // backgroundColor: palette.form?.backgroundColor.disabled,
          '& .MuiIconButton-root.Mui-disabled': {
            color: palette.grey[400],
          },
        },
      },
      '& .ag-body-viewport': {
        background: palette.background.paper,
      },
      '& .ag-overlay-no-rows-center': {
        color: palette.text.primary,
      },
      '& .ag-react-container': {
        height: '100%',
        width: '100%',
      },
    },
    pagination: {
      background: palette.background.paper,
      '& .ag-paging-page-summary-panel, & .MuiTablePagination-toolbar': {
        justifyContent: 'end',
      },
    },
    labelDisplayedRows: {
      display: 'flex',
      gap: '35px',
    },
    rowEditing: {
      '& .ag-body-viewport': {
        overflow: 'hidden',
      },
      '& .ag-header-viewport': {
        pointerEvents: 'none',
      },
      '& .ag-full-width-container .ag-row': {
        pointerEvents: 'none',
      },
    },
    disablePagination: {
      '& .ag-paging-page-summary-panel, & .MuiTablePagination-toolbar': {
        pointerEvents: 'none',
        opacity: 0.6,
      },
    },
    footerActions: {
      height: '90%',
    },
    // controlled from parent component do not remove
    customHeight: {},
  });
};
