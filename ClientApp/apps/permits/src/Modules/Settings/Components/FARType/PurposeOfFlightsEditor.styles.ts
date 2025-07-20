import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  root: {
    padding: '5px',
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
});
