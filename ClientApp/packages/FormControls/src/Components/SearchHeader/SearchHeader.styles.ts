import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { flexRow } from '@wings-shared/core';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      ...flexRow(theme),
      width: '100%',
      marginBottom: theme.spacing(1),
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      '& $searchInput, & $selectInputControl, & $backButton': {
        marginRight: theme.spacing(1),
      },
    },
    backButton: {},
    searchInput: { width: 480 },
    selectInputControl: { minWidth: 130 },
    rightContent: {
      ...flexRow(theme),
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '10px',
    },
  });

// Styles for V2 Version Above version Will be removed
export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    ...flexRow(theme),
    width: '100%',
    marginBottom: theme.spacing(1),
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    '& $searchInput, & $selectInputControl, & $backButton': {
      marginRight: theme.spacing(1),
    },
  },
  backButton: {},
  searchInput: { width: 480 },
  selectInputControl: { minWidth: 130 },
  hideSelectInputControl: { display: 'none' },
  rightContent: {
    ...flexRow(theme),
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
  },
}));
