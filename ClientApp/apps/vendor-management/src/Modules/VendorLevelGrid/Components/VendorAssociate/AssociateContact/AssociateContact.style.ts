import { createStyles, Theme } from '@material-ui/core';

export const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    modalDetail: {
      paddingBottom: '20px',
      alignContent: 'center',
      justifyContent: 'space-around',
    },
    btnContainer: {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
    },
    fullFlex: {
      paddingBottom: spacing(3),
      paddingRight: spacing(0),
      flexBasis: '100%',
    },
    warningErrorMessage:{
      wordWrap:'break-word'
    }
  });