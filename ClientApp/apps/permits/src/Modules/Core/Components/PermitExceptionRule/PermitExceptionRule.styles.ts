import { makeStyles } from '@material-ui/core';
import { ITheme } from '@wings-shared/core';

export const useStyles = makeStyles(({ spacing, palette }: ITheme) => ({
  flexWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: spacing(4),
    borderBottom: `2px solid ${palette.divider}`,
  },
  action: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  delete: {
    padding: 0,
    paddingLeft: spacing(2),
    color: palette.secondary.main,
    '&:hover span': {
      color: palette.error.light,
    },
  },
  titleRoot: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  accordionRoot: {
    paddingLeft: spacing(3),
  },
  exceptionRule: {
    flexBasis: '66.6%',
    paddingRight: spacing(3),
  },
  rule: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  filledError: {
    color: '#cd263c',
    width: '320px',
    paddingTop: 0,
    paddingBottom: 0,
  },
}));
