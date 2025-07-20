import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    modaldetail: {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: '20px',
    },
    cardContainer: {
      marginBottom: 10,
      cursor: 'pointer',
    },
    formContainer: {
      padding: '10px',
      background: palette.background.paper,
      alignItems: 'center',
      justifyContent: 'space-between',
      '&:last-child': {
        padding: '10px',
      },
    },
    formSection: {
      width: '100%',
    },
    userGroupWidth: { width: 750 },
    modalRoot: {
      '& div.MuiPaper-root': {
        background: palette.background.default,
      },
    },
  });
