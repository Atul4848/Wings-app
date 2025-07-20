import { makeStyles, Theme } from '@material-ui/core';
import { ChipControlStyles } from '@wings/shared';

export const useStyles = makeStyles((theme: Theme) => ({
  ...ChipControlStyles(theme),
  flexContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
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
  inputControl: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '50%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  textInputRoot: {
    height: 100,
  },
  fullFlex: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '100%',
  },
  leftIndent: {
    paddingLeft: theme.spacing(6),
  },
  labelRoot: {
    width: '66%',
    paddingRight: 14,
    minWidth: 120,
  },
}));
