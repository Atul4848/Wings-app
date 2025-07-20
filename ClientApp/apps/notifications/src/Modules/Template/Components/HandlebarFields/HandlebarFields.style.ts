
import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme,) =>({
  fieldsContainer: {
    width: '18%',
  },
  fields: {
    border: '1px solid #ccc',
    height: '385px',
    overflowY: 'auto',
    background: theme.palette.grey[100],
  },
}))
  