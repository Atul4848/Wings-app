import { ComponentsOverrides, Theme } from '@mui/material/styles';


export const tableOverrides = (theme: Theme): ComponentsOverrides['MuiTable'] => ({
  root: {
    borderRadius: 4,
    borderCollapse: 'separate',
  },
});

export const tableContainerOverrides = (theme: Theme): ComponentsOverrides['MuiTableContainer'] => ({
  root: {
    borderRadius: 4,
  },
});

export const tableHeadOverrides = (theme: Theme): ComponentsOverrides['MuiTableHead'] => ({
  root: {
    borderRadius: '4px 4px 0 0',
    '& + tbody tr:first-child td': {
      borderTop: 0,
      '&:first-child, &:last-child': {
        borderRadius: 0,
      },
    },
  },
});

export const tableBodyOverrides = (theme: Theme): ComponentsOverrides['MuiTableBody'] => {
  const palette = theme.palette.table;
  return {
    root: {
      '& tr:first-child td': {
        borderTop: `1px solid ${palette.cell.borderColor.default}`,
        '&:first-child': {
          borderRadius: '4px 0 0 0',
        },
        '&:last-child': {
          borderRadius: '0 4px 0 0',
        },
      },
      '& tr:last-child td:first-child': {
        borderRadius: '0 0 0 4px',
      },
      '& tr:last-child td:last-child': {
        borderRadius: '0 0 4px 0',
      },
      '& tr:hover td': {
        backgroundColor: palette?.row?.backgroundColor.hovered,
      },
      '& tr.Mui-selected td': {
        backgroundColor: palette?.row?.backgroundColor.selected,
      },
      '& tr.Mui-selected:hover td': {
        backgroundColor: palette?.row?.backgroundColor.selectedHovered,
      },
    },
  };
};


export const tableCellOverrides = (theme: Theme): ComponentsOverrides['MuiTableCell'] => {
  const palette = theme.palette.table;
  const formPalette = theme.palette.form;
  return {
    root: {
      fontSize: 12,
      lineHeight: '12px',
      paddingRight: 10,
      paddingLeft: 10,
      paddingTop: 15,
      paddingBottom: 15,
      borderBottom: `1px solid ${palette.cell.borderColor.default}`,
      transition: 'background-color .05s linear',
      '& a': {
        color: theme.palette.basicPalette.primary,
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
        },
      },
    },
  };
};

export const tablePaginationOverrides = (theme: Theme): ComponentsOverrides['MuiTablePagination'] => {
  const formPalette = theme.palette.form;
  return {
    selectRoot: {
      height: 30,
      width: 60,
      border: `1px solid ${formPalette.borderColor?.default}`,
      borderRadius: 4,
      overflow: 'hidden',
      marginRight: 40,
      marginLeft: 10,
    },
    select: {
      padding: 0,
      height: '100%',
      paddingTop: 10,
      border: 'none !important',
    },
    selectIcon: {
      right: 0,
    },
    spacer: {
      display: 'none',
    },
    toolbar: {
      padding: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    root:{
      '& .MuiTablePagination-caption':{
        opacity: 0.6,
      },
    }
  };
};
