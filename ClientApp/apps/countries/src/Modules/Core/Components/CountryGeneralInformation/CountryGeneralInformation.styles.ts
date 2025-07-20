import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  sanctionBtn: {
    minWidth: '180px',
    textDecoration: 'none',
    fontSize: theme.spacing(2),
    marginLeft: theme.spacing(3),
    color: theme.palette.secondary.light,
    textTransform: 'capitalize',
    fontWeight: 600,
    '&:hover': {
      textDecoration: 'none',
    },
  },
  btnLabel: {
    fontSize: theme.spacing(2),
  },
}));
