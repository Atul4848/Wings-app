import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: palette.background.paper,
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
}));
