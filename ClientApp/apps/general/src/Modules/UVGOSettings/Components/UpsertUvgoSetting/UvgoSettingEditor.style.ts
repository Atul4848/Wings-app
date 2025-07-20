import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ChipControlStyles } from '@wings/shared';

export const styles = (theme: Theme) =>
  createStyles({
    ...ChipControlStyles(theme),
    flexRow: {
      display: 'flex',
      flex: 1,
      width: '100%',
      overflowY: 'auto',
      flexDirection: 'column',
    },
    flexWrap: {
      flexWrap: 'wrap',
      display: 'flex',
    },
    collapsaSection: {
      '& > div:first-child': {
        background: '#eee',
        padding: '0 15px',
        marginRight: '15px',
      },
    },
  });
  
export const useStyles = makeStyles((theme: Theme) => ({
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
  },
  headerActions:{
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
  },
  collapsaSection: {
    '& > div:first-child': {
      background: '#eee',
      padding: '0 15px',
      marginRight: '15px',
    },
  },
}));
