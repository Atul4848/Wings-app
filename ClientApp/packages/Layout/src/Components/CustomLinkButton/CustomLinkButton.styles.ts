import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => 
createStyles({
  link: {
    textDecoration: 'none',
    padding: 'inherit',
    lineHeight: 'initial',
    '& button': {
      textTransform: 'capitalize',
      '&.MuiButton-containedPrimary:hover':{
        backgroundColor: theme.palette.primary.light,
      },
    },
  },
});
