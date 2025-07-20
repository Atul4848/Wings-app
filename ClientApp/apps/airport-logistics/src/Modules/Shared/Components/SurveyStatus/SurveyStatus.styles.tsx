import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 30,
  },
  label: {
    flexShrink: 0,
    marginRight: 10,
    color: palette.grey['400'],
    '&.approved': {
      color: palette.success.main,
    },
    '&.underreview': {
      color: palette.info.main,
    },
    '&.pending': {
      color: palette.warning.main,
    },
  },
  count: {
    color: palette.primary.contrastText,
  },
  status: {
    width: 12,
    height: 12,

    '&.table': {
      borderRadius: '50%',
    },
    '&.approved': {
      background: palette.success.main,
    },
    '&.underreview': {
      background: palette.info.main,
    },
    '&.pending': {
      background: palette.warning.main,
    },
  },
}));