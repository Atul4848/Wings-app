import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  checkBoxSection:{
    position: 'relative',
    top: 10,
    paddingLeft: 18,
    display: 'flex',
  },
  checkBox:{
    position: 'absolute',
  },
  subTitle: {
    marginBottom: 10,
  },
  userMappedWidth: {
    width: 700,
  },
  container: {
    '& > div:first-child': {
      maxHeight: '100%',
      height: '100%',
      minHeight: '210px',
      padding: 15,
    },
    '& div.ag-root-wrapper-body.ag-layout-normal': {
      height: '100%',
      minHeight: '100%',
    },
    '& div.ag-overlay': {
      position: 'relative',
      marginTop: 30,
    },
    '& div.ag-header-cell': {
      '&:first-child': {
        '& div.ag-react-container img': {
          display: 'none',
        },
      },
    },
    '& button.MuiButton-root': {
      backgroundColor: theme.palette.basicPalette.primary,
      width: 100,
      minHeight: 40,
      '& svg': {
        display: 'none',
      },
    },
    '& div.ag-theme-alpine': {
      '& div.MuiTablePagination-selectRoot': {
        marginRight: 0,
      },
      '& .MuiTablePagination-caption div div': {
        '&:first-child': {
          position: 'relative',
          left: 35,
        },
        '&:last-child': {
          position: 'relative',
          left: 65,
          width: 130,
          textAlign: 'center',
        },
      },
      '& div.MuiTablePagination-actions': {
        '& button': {
          '&:first-child': {
            position: 'relative',
            right: 130,
          },
        },
      },
    },

    '& div.ag-popup': {
      height: 'auto',
    },

    '& div.ag-body-viewport::-webkit-scrollbar-track': {
      marginTop: 5,
      borderRadius: 10,
      backgroundColor: theme.palette.background.paper,
    },
    '& div.ag-body-viewport::-webkit-scrollbar': {
      width: 8,
      backgroundColor: theme.palette.background.paper,
    },
    '& div.ag-body-viewport::-webkit-scrollbar-thumb': {
      borderRadius: 10,
      backgroundColor: theme.palette.divider,
    },
    '& div.ag-cell': {
      color: theme.palette.grey.A700,
      '&:last-child': {
        paddingLeft: '10px !important',
      },
    },
    '& div.ag-header-row': {
      background: theme.palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-header-viewport': {
      background: theme.palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-row-odd': {
      background: 'transparent',
    },
  },
}));
