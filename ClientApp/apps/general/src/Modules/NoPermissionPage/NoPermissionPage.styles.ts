import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    paddingBottom: 100,
    marginBottom: 5,
    justifyContent: 'center',
    height: '100%',
  },
}));
  