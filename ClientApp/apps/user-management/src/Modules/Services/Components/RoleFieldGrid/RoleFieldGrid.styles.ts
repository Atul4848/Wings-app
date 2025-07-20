import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.primary.main,
  },
  subTitle: {
    marginBottom: 10,
  },
  userMappedWidth: {
    width: 700,
  },
  container: {
    '& > div:first-child': {
      height: 'calc(100vh - 510px)',
      maxHeight: 'calc(100vh - 510px)',
      minHeight: '210px',
    },
    '& div.ag-header-cell': {
      '&:first-child': {
        '& div.ag-react-container img': {
          display: 'none',
        },
      },
    },
    '& button.MuiButton-root': {
      position: 'relative',
      backgroundColor: theme.palette.basicPalette.primary,
      width: 100,
      bottom: 26,
      minHeight: 40,
      margin: 0,
      '& svg': {
        display: 'none',
      },
    },
    '& div.ag-theme-alpine': {
      height: 'calc(100vh - 235px)',
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
    },
    '& div.ag-row': {
      alignItems: 'center',
      display: 'flex',
    },
    '& div.ag-cell': {
      color: theme.palette.grey.A700,
      whiteSpace: 'normal',
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
