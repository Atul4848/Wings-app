import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    modalRoot: {
      flex: 1,
    },
    paperSize: {
      width: 1150,
      height: 500,
      margin: 'auto',
    },
    headerWrapper: {
      margin: 0,
      wordBreak: 'break-all',
    },
    headerContainerTop: {
      display: 'flex',
      alignItems: 'center',
      background: palette.background.default,
      padding: '15px 0px',
      justifyContent: 'space-between',
    },
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: palette.background.paper,
      padding: 15,
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
      height: 300,
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
  });

export const useStyles = makeStyles((theme: Theme) => ({
  modalRoot: {
    flex: 1,
  },
  paperSize: {
    width: 1150,
    height: 500,
    margin: 'auto',
  },
  headerWrapper: {
    margin: 0,
    wordBreak: 'break-all',
  },
  headerContainerTop: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.background.default,
    padding: '15px 0px',
    justifyContent: 'space-between',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: 15,
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
    height: 300,
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
