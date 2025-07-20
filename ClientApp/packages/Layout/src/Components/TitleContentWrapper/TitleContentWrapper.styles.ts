import { createStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
    root: {
      border: '.5px solid lightgray',
      margin: '12px 24px 12px 12px',
      height: 'calc(100% - 50px)',
      overflowY: 'auto',
    },
    content: {
      paddingLeft: 16,
      paddingTop: 16,
      height: 'inherit',
    },
    title: {
      padding: '16px 0',
      borderBottom: '.5px solid lightgray',
      paddingLeft: 16,
      fontWeight: 600,
    },
    permitTitle: {
      margin: '0 12px',
    },
    wrapper: {
      height: '100%',
    },
  });
