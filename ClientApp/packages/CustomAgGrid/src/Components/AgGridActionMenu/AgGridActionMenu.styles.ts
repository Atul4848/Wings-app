import { createStyles } from '@material-ui/core/styles';

export const styles = () => {
  return createStyles({
    link: {
      textDecoration: 'none',
      lineHeight: 'initial',
      color: 'inherit',
      padding: '10px 12px',
      width: '100%',
    },
    paperRoot:{
      minWidth: '100px',
    },
  });
}

