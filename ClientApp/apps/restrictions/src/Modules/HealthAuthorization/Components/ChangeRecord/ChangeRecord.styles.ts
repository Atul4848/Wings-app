import { Theme,makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>({
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'end',
    marginRight: 16,
  },
  gridWrapper: {
    height: '100%',
    paddingRight: 16,
    marginTop: 16,
  },
}))
