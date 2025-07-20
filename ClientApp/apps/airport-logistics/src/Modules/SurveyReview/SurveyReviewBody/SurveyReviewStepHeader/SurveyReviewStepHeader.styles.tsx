import { createStyles } from '@material-ui/core';
import { lighten, darken } from '@material-ui/core/styles/colorManipulator';

export const styles = createStyles(({ palette }) => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
  },
  heading: {
    flexGrow: 1,
    fontWeight: 700,
    color: palette.grey['A300'],
    margin: 0,
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: darken(palette.success.dark, 0.4),
    backgroundColor: lighten(palette.success.main, 0.6),
    color: darken(palette.success.dark, 0.3),
    padding: 10,
    marginLeft: 10,
    borderRadius: 4,
  },
  alertIcon: {
    height: 24,
    marginRight: 5,
  },
  overlay: {
    marginLeft: 15,
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  menuItemText: {
    fontSize: 12,
  },
  unSubmitButtonText: {
    whiteSpace: 'nowrap',
  },
}));
