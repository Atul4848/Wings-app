import { makeStyles } from '@material-ui/core';

export const useHeaderStyles = makeStyles(() => ({
  profile: {
    marginLeft: 15,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  dropdown: {
    width: 13,
    height: 13,
  },
}));
