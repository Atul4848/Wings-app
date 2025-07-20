import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  link: {
    padding: '0 5px',
    '&:hover': {
      '& .MuiButton-label': {
        textDecoration: 'none',
      },
    },
    '& .MuiButton-label': {
      '& span': {
        position: 'relative',
        bottom: '2px',
      },
    },
  },
}));
