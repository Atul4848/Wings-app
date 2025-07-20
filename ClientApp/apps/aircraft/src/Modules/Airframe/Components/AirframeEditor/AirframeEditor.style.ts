import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
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
    flexBasis: '99%',
  },
  textInput: {
    '& [class*="Mui-disabled"]': {
      opacity: 1,
    },
    width: '32%',
  },
  typography: {
    fontWeight: 'bolder',
    padding: '15px 0',
  },
  paperSize: {
    width: '1100px',
  },
  infoIcon: {
    padding: '0 12px',
  },
  gridRoot: {
    flexBasis: '100%',
    marginTop: '10px',
    marginBottom: '20px',
    '& > div': {
      minHeight: '300px',
      padding: 0,
    },
  },
  customHeight: {
    height: '75%',
  },
}));
