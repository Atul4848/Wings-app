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
      transition: 'height 600ms ease-out',
    },
    titleWrapper: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      paddingTop: spacing(2),
      paddingBottom: spacing(2),
    },
    title: {
      paddingTop: spacing(0.5),
      paddingBottom: spacing(1),
      fontWeight:600,
      fontSize: spacing(2),
    },
    collapsibleIcons: {
      cursor: 'pointer',
      display: 'flex',
    },
  });
