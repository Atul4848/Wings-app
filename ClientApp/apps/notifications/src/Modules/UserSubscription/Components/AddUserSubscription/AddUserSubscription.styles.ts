import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    fullFlex: {
      paddingBottom: spacing(3),
      paddingRight: spacing(0),
      flexBasis: '100%',
    },
    flexRow: {
      display: 'flex',
      flex: 1,
      width: '100%',
      overflowY: 'auto',
      flexDirection: 'column',
    },
    flexWrap: {
      flexWrap: 'wrap',
      display: 'flex',
    },
    paperSize: {
      width: 1000,
    },
    filterField: {
      display: 'flex',
      flex: 1,
      width: '100%',
      overflowY: 'auto',
      flexDirection: 'column',
      flexBasis: 'auto',
    },
    btnContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '10px',
      paddingRight: '23px',
    },
  });

