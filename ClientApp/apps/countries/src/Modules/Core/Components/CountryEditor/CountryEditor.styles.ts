import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  disabled: {
    opacity: '0.3',
    filter: 'grayscale(1)',
    pointerEvents: 'none',
  },
  flexWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
  },
  cappsEditorBox: {
    display: 'flex',
    width: '100%',
    background: theme.palette.background.default,
    padding: theme.spacing(1),
  },
  editorBtn: {
    textAlign: 'right',
    paddingTop: theme.spacing(3),
  },
  flexColumn: {
    paddingRight: '0 !important',
  },
  flexRow: {
    display: 'flex',
    width: '100%',
  },
}));
