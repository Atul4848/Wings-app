import { createStyles } from '@material-ui/core/styles';
import { ITheme } from '@wings-shared/core';

export const styles = ({ spacing, palette }: ITheme) =>
  createStyles({
    buttonGroup: {
      display: 'flex',
      borderRadius: '4px',
      height: '100%',
      alignItems: 'center',
      pointerEvents: 'none',
    },
    editingMode: {
      paddingLeft: spacing(2),
      pointerEvents: 'all',
    },
    button: {
      border: '1px solid',
      borderColor: palette.divider,
      borderRadius: 4,
      margin: 2,
      padding: 5,
      backgroundColor: palette.background.default,
    },
    buttonActive: {
      color: palette.common.white,
      backgroundColor: (palette.buttons?.primary as any)?.contained?.backgroundColor.default,
    },
    disabled: {
      opacity: '0.7',
      filter: 'grayscale(1)',
      pointerEvents: 'none',
      backgroundColor: palette.form?.backgroundColor.disabled,
    },
  });
