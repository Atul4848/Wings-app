import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  headerContainerTop: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.background.default,
  },
  headerContainerName: {
    marginLeft: 10,
  },
  searchContainer:{
    display: 'flex',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: 15,
    justifyContent: 'space-between',
  },
  mainroot: {
    display: 'flex',
    height: '100%',
    width: '100%',
    '& div.ag-row-odd': {
      background: 'transparent',
    },
  },
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& div.ag-react-container > button': {
      display: 'flex',
      justifyContent: 'center',
      paddingTop: 15,
      width: '100%',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
}));
