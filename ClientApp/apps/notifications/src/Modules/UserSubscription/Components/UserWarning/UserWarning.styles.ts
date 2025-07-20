import { createStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
    backBtn: {
      marginTop: '15px',
      '& > div:first-child': {
        paddingLeft: '0',
      },
    },
  });

