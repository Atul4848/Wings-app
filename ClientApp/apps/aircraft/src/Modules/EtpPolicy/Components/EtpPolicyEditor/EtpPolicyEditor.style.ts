import { makeStyles, Theme } from '@material-ui/core/styles';
import { ChipControlStyles } from '@wings/shared';

export const useStyles = makeStyles((theme: Theme) => ({
  ...ChipControlStyles(theme),
  container: {
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
    flexBasis: '33%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  fullFlex: {
    flexBasis: '100%',
  },
  typography: {
    padding: '15px 0',
    fontSize: 16,
    fontWeight: 600,
  },
  chip:{
    minHeight:'30px',
  },
}));
