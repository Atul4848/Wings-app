import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ spacing, palette }: Theme) =>
  createStyles({
    tooltip: {
      backgroundColor: palette.common.white,
      color: palette.common.black,
      border: `1px solid ${palette.divider}`,
      borderRadius: spacing(0.3),
      fontSize: '13px',
    },
  });
