import { createStyles, Theme } from '@material-ui/core';

export const styles = createStyles(({ palette }: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    height: 300,
    maxHeight: 350,
    width: '100%',
    background: palette.background.paper,
  },
  addButton: {
    marginBottom: 10,
  },
}));
