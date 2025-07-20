import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '12px',
  },
  chip: {
    minWidth: 40,
    margin: 4,
    maxWidth: 200
  },
  popoverRoot: {
    padding: '8px',
    width: '250px',
    maxHeight: '300px',
    paddingRight: '0',
  },
  popoverContent: {
    paddingRight: '8px',
    maxHeight: '250px',
    overflow: 'auto',
  },
  popoverActions: {
    flex: '0 0 auto',
    display: 'flex',
    padding: '8px',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  limitedTagsContainer: {
    display: 'flex',
    gap: '3px',
  },
  allTagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  inputRoot: {
    '&&[class*="MuiOutlinedInput-root"]': {
      height: '100%',
    },
  },
}));