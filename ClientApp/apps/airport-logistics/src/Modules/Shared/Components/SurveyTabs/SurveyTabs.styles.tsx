import { createStyles, Theme } from '@material-ui/core';

export const styles = createStyles(( theme: Theme ) => ({
  container: {
    display: 'flex',
    background: theme.palette.grey['A400'],
    color: theme.palette.primary.main,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  tabsRoot: {
    position: 'relative',
  },
  tabsContent: {
    position: 'relative',
  },
  infoIcon: {
    position: 'absolute',
    top: 8,
    right: 24,
    color: theme.palette.warning.main,
  },
}));
