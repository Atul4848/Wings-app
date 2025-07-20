import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',

    '& svg.MuiSvgIcon-root': {
      fontSize: '1.3rem',
      marginLeft: '5px',
    },
  },
  tooltipMessage: {
    color: theme.palette.error.main,
  },
}));
