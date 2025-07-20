import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  mainWrapper:{
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    marginLeft: '10px',
    fontSize: '18px',
  },
  textEllipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 600,
    fontSize: '18px',
  },
  titleContainer:{
    display: 'flex',
    overflow: 'hidden',
    paddingRight: 5,
  },
}));
