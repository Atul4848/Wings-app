import { makeStyles } from '@material-ui/core';

const useAgGridActionButtonStyles = makeStyles(theme => ({
  customToolTip: {
    border: `1px solid ${theme.palette.background.default}`,
    background: theme.palette.background.paper,
  },
  customArrow: {
    '&::before': {
      border: `1px solid ${theme.palette.background.default}`,
    },
    color: theme.palette.background.paper,
  },
  viewIcon: {
    color: theme.palette.primary.main,
  },
  infoIcon: {
    '& svg': {
      fill: '#1976D2',
    },
  },
  disabled: {
    '& svg': {
      fill: 'rgba(0, 0, 0, 0.25) !important'
    },
  }
}));
export default useAgGridActionButtonStyles;
