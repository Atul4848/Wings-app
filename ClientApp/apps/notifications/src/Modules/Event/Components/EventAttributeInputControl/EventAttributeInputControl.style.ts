import { createStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
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
    inputControl: {
      display: 'flex',
      flexBasis: '100%',
      '& label:last-child': {
        marginTop: '3px',
        marginLeft: '0',
        '& span': {
          padding: '0',
        },
      },
    },
    textRoot: {
      width: '300px',
      marginTop: '7px',
    },
  });
