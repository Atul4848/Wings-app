import { createStyles } from '@material-ui/core/styles';

export const globalStyles = () =>
  createStyles({
    '@global': {
      html: {
        width: '100%',
        height: '100%',
      },
      body: {
        width: '100%',
        height: '100%',
      },
      '#root': {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      },
    },
  });
