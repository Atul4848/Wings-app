import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ spacing }: Theme) =>
  createStyles({
    root: {
      flex: '1 2 100%',
      display: 'flex',
      placeContent: 'center flex-end',
      gridGap: spacing(0.5),
    },
  });
