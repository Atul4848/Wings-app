import { createStyles, Theme } from '@material-ui/core/styles';
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
