import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    searchHeader: {
      display: 'flex',
    },
    searchWrapper: {
      display: 'flex',
      width: '50%',
      alignItems: 'center',
    },
    searchInput: {
      width: 350,
      padding: theme.spacing(1),
      paddingLeft: 0,
    },
    selectInputControl: { width: 120 },
    uploadButtonWrapper: {
      display: 'flex',
      width: '50%',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
  });

export const useStyles = makeStyles((theme: Theme) => ({
  searchHeader: {
    display: 'flex',
  },
  searchWrapper: {
    display: 'flex',
    width: '50%',
    alignItems: 'center',
  },
  searchInput: {
    width: 350,
    padding: theme.spacing(1),
    paddingLeft: 0,
  },
  selectInputControl: { width: 120 },
  uploadButtonWrapper: {
    display: 'flex',
    width: '50%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
}));
