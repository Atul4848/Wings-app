import { createStyles, Theme } from '@material-ui/core/styles';

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
    modalRoot: {
      '& div.MuiPaper-root': {
        background: palette.background.default,
        width: '630px',
      },
    },
    fullFlex: {
      paddingBottom: spacing(1),
      paddingRight: spacing(0),
      flexBasis: '100%',
      width: '80%',
    },
    rowContainer: {
      display: 'flex',
      alignContent: 'center',
    },
    iconSection: {
      display: 'flex',
      fontSize: 12,
      alignItems: 'end',
    },
    icon: {
      fontSize: 18,
    },
    checkBoxSection: {
      '& span': {
        paddingLeft: 0, 
      },
    },
  });
