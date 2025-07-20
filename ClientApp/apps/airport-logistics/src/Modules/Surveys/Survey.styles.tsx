import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = createStyles(( theme: Theme ) => ({
  scroll: {
    height: '100%',
  },
  noDataLabel: {
    padding: '10px',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));
