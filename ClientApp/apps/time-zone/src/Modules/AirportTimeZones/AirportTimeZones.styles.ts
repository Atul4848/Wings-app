import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  search: {
    padding: theme.spacing(1),
    paddingLeft: 0,
    flex: '1 1 100%',
    display: 'flex',
  },
  selectAllServices: {
    placeContent: 'center flex-end',
    display: 'flex',
    flex: '1 1 100%',
  },
  searchWrapper: {
    alignItems: 'center',
    display: 'flex',
  },
  paperWrapper: {
    margin: 0,
    display: 'flex',
    padding: '1px 5px',
    flexWrap: 'wrap',
    listStyle: 'none',
    width: '50%',
    height: '40px',
    alignItems: 'center',
    border: '1px solid',
    '&::after': {
      content: '"Input ICAO"',
    },
  },
  chip: {
    height: '25px',
  },
  actionFooter: {
    flexDirection: 'column',
    boxSizing: 'border-box',
    display: 'flex',
    placeContent: 'flex-end center',
    alignItems: 'flex-end',
    marginTop: '4%',
  },
  margin: {
    margin: '5px',
  },
  uploadButtonWrapper: {
    display: 'flex',
    width: '50%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
}));