import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  infoContent: {
    border: `1px solid ${theme.palette.grey['600']}`,
    overflowY: 'auto',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: '100%',
  },
}));
