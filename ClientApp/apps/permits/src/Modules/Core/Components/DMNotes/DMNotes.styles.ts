import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    border: '.5px solid lightgray',
    margin: '12px 24px 12px 12px',
    height: 'calc(100% - 50px)',
    overflowY: 'auto',
  },
  content: {
    paddingLeft: 16,
    paddingTop: 16,
    height: 'inherit',
  },
  permitTitle: {
    margin: '0 12px',
  },
  wrapper: {
    height: '100%',
  },
  flexRow:{
    overflow:'visible'
  },
}));
