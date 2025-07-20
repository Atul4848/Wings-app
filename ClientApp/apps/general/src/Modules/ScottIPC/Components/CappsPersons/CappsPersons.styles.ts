import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  button: {
    height: '25px',
  },
  tableHeader: {
    '& th': {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.grey['500'],
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
  },
  tableBody: {
    '& td': {
      backgroundColor: theme.palette.grey['700'],
      borderBottom: `1px solid ${theme.palette.grey['400']}`,
      padding: '4px 16px',
    },
  },
  scroll: {
    maxHeight: 230,
  },
}));