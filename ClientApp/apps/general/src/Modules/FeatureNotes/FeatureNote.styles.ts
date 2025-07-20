import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: 15,
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  icon: {
    width: 30,
    marginRight: 10,
    fontSize: 30,
  },
  heading: {
    fontSize: 22,
  },
  mainroot: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  subSection: {
    display: 'flex',
    alignItems: 'center',
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    '& label span:last-child': {
      width: '100px',
    },
  },
  paperSize: {
    height: '80%',
    width: '65%',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  root: {
    height: '100%',
    width: '100%',
    border: '1px solid #ccc',
    padding: '10px',
    overflowY: 'scroll',
  },
}));