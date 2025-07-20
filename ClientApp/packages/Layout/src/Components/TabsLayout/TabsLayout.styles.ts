import { createStyles, Theme } from '@material-ui/core';
import { flexColumn } from '@wings-shared/core';

export const getTabsStyles = createStyles((theme: Theme) => ({
  root: {
    ...flexColumn(theme),
    height: '100%',
  },
  tabList: {
    borderBottom: '1px solid',
    fontSize: 'smaller',
  },
  tabPanel: {
    height: 'calc(100vh - 210px)',
    padding: 0,
    paddingTop: theme.spacing(2),
  },
  tabRoot: {
    padding: '0',
    minWidth: '0',
    marginRight: theme.spacing(3),
  },
  tabWrapper: {
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 600,
  },
}));
