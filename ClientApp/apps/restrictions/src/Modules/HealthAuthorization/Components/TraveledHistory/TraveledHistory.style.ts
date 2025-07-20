import { Theme, makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  flexRow: {
    height: 'calc(100vh - 320px)',
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
    flexBasis: '50%',
  },
  fullFlex: {
    flexBasis: '100%',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
}));
