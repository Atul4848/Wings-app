import { createStyles, Theme ,makeStyles} from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      minHeight: 30,
      borderRadius: 5,
      border: '1px solid',
      borderColor: theme.palette.primary.main,
    },
    indicator: {
      background: 'transparent',
    },
    tabRoot: {
      height: 30,
      minHeight: 30,
      flex: 1,
      borderRight: '1px solid',
      minWidth: 'auto',
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },
    lastTab: { border: 'none' },
    tabSelected: {
      color: theme.palette.common.white,
      background: theme.palette.primary.main,
    },
  });

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: 30,
    borderRadius: 5,
    border: '1px solid',
    borderColor: theme.palette.primary.main,
  },
  indicator: {
    background: 'transparent',
  },
  tabRoot: {
    height: 30,
    minHeight: 30,
    flex: 1,
    borderRight: '1px solid',
    minWidth: 'auto',
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
  lastTab: { border: 'none' },
  tabSelected: {
    color: theme.palette.common.white,
    background: theme.palette.primary.main,
  },
}));
