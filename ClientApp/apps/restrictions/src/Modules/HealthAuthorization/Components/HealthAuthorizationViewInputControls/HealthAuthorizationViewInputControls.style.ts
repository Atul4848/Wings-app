import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
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
  tabPanel: {
    overflowY: 'auto',
    // height: 'calc(100vh - 335px)',
    padding: '24px 0',
  },
  tabRoot: {
    minWidth: 'fit-content',
  },
  halfFlex: {
    flexBasis: '50%',
  },
  fullFlex: {
    flexBasis: '100%',
  },
  leftIndent: {
    paddingLeft: theme.spacing(6),
  },
  customComponentContainer: {
    marginRight: 20,
    width: '100%',
    marginBottom: '50px',
  },
}));
