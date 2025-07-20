import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    flex: 1,
    height: '100%',
    padding: theme.spacing(2),
  },
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
  halfRowFlex: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '25%',
  },
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
  },
  inputControl: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '25%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  halfFlex: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '50%',
  },
  fullFlex: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '100%',
  },
  etpPenaltiesGrid: {
    height: 600,
  },
  labelRoot: {
    width: '50%',
    paddingRight: 14,
    minWidth: 120,
  },
  paperSize: {
    width: 1150,
  },
  headerWrapper: {
    margin: 0,
    wordBreak: 'break-all',
  },
  subContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));