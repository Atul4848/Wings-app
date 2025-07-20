import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    height: '100%',
    maxHeight: 350,
    padding: spacing(2),
    background: palette.background.paper,
  },
  noPadding: { padding: 0 },
  infoContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoMessage: {
    color: palette.error.main,
  },
  btnContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  resetHeight: {
    maxHeight: 'unset',
  },
  iconButton: {
    '&.MuiIconButton-root': {
      padding: '0px 12px',
    },
  },
}));
