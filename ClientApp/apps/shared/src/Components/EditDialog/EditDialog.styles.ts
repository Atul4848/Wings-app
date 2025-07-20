import { createStyles, Theme } from '@material-ui/core';

export const styles = createStyles((theme: Theme) => ({
  modalWidth: {
    width: '950px',
    height: '100%',
  },
  headerWrapper: {
    margin: 0,
    wordBreak: 'break-all',
  },
  tabPanel: {
    padding: 0,
    paddingTop: theme.spacing(2),
    height: '100%',
  },
  btnLabel: {
    fontSize: theme.spacing(2),
  },
  noTabs: {
    paddingTop: theme.spacing(2),
  },
}));
