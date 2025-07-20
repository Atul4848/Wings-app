import { createStyles } from '@material-ui/core/styles';
import { ITheme } from '@wings-shared/core';

export const styles = ({ spacing }: ITheme) =>
  createStyles({
    root: {
      paddingTop: spacing(1),
    },
    flexWrap: {
      display: 'flex',
      flexWrap: 'wrap',
      width: '100%',
    },
    title: {
      paddingTop: spacing(0.5),
      paddingBottom: spacing(0.5),
    },
  });
