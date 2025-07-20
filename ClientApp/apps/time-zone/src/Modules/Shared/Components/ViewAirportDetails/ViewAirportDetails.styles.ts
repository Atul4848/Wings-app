import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  paperSize: {
    width: '70%',
    height: '80vh',
  },
  titleWrapper: {
    display: 'flex',
  },
  iconButton: {
    '&.MuiIconButton-root': {
      padding: '2px 12px',
    },
  },
}));
