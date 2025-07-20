import { createStyles, Theme } from '@material-ui/core/styles';

export const  getBaseActionsStyles = (theme: Theme) =>
  createStyles({
    root: {
      minWidth: 40,
      width: 40,
    },
    buttonContainer: {
      display: 'flex',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
    },
  });
