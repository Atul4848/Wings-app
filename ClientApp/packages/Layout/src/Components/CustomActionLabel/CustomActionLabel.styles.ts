import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'space-between',
      lineHeight: 'inherit',
      fontSize:'12px',
      fontWeight: 600,
    },
    fullWidth: {
      width: '100%',
    },
    icon: {
      height: '15px',
      width: '15px',
      cursor: 'pointer',
      color: palette.text.primary,
      pointerEvents: 'all',
    },
  });
