import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) =>({
  userListContainer: {
    background: palette.background.paper,
    padding: 20,
  },
  applicationsListContainer:{
    display: 'flex',
    justifyContent: 'space-between',
  },
  resizeContainer:{
    position: 'relative',
    bottom: 3,
    right: 3,
    '& button': {
      backgroundColor: 'transparent !important',
    },
  },
  headerContainer: {
    width: '100%',
    display: 'flex',
  },
  
  rootControl: {
    flexDirection: 'column',
  },
  mainroot: {
    display: 'flex',
    height: 'calc(100vh - 195px)',
    width: '100%',
    '& div.ag-theme-alpine': {
      height: 'calc(100vh - 235px)',
      '& div.MuiSelect-select': {
        border: '1px solid #CBCDD5',
        borderRadius: 3,
      },
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
      backgroundColor: palette.background.paper,
    },
    '& div.ag-body-viewport::-webkit-scrollbar': {
      width: 8,
      backgroundColor: palette.background.paper,
    },
    '& div.ag-body-viewport::-webkit-scrollbar-thumb': {
      borderRadius: 10,
      backgroundColor: '#D9D9D9',
    },
    '& div.ag-cell': {
      color: palette.grey.A700,
      '&:nth-child(3) > div > div': {
        padding: '0px',
        marginTop: 5,
      },
      '&:last-child': {
        paddingTop: 9,
        paddingLeft: '21px !important',
      },
    },
    '& div.ag-header-row': {
      background: '#5F5F5F',
    },
    '& div.ag-header-viewport': {
      background: '#5F5F5F',
    },
    '& div.ag-react-container svg': {
      fill: '#1976D2',
    },
    '& div.ag-row-odd': {
      background: 'transparent',
    },
    '& div.MuiChip-colorPrimary': {
      color: '#5f5f5f',
      background: '#e7e7e7',
      padding: '3px 20px',
      height: 31,
      width: 140,
      fontWeight: 600,
    },
    '& div.MuiChip-colorSecondary': {
      background: '#E8F2DD',
      color: '#66A71D',
      padding: '3px 20px',
      height: 31,
      width: 140,
      fontWeight: 600,
    },
  },
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& div.ag-react-container > div': {
      justifyContent: 'end',
    },
  },
  flexSection: {
    display: 'flex',
    '& button': {
      width : 'max-content',
      backgroundColor: '#1976D2',
      boxShadow: 'none',
      height: 40,
      '&:hover': {
        backgroundColor: '#63A4FF',
      },
    },
  },
}));
