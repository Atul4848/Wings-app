import { Theme, makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'default',
    borderRadius: 2,
    height: 20,
    flex: 1,
    marginTop: '8px',
  },
  levelOne: { backgroundColor: '#22AC4A' },
  levelTwo: { backgroundColor: '#1A4DA6' },
  levelThree: { backgroundColor: '#FAB433' },
  levelFour: { backgroundColor: '#F46932' },
  levelFive: { backgroundColor: '#EB293A' },
  colorBox: {
    height: 20,
    width: 20,
  },
  threatBarStep: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    height: '100%',
    opacity: 0.5,
  },
  threatBarStepActive: {
    boxShadow: '0px 2px 5px 1px rgba(0,0,0,0.45)',
    height: 30,
    opacity: 1,
    cursor: 'pointer',
  },
  threatBarStepInActive: {
    backgroundColor: theme.palette.text.disabled,
    color: theme.palette.text.primary,
  },
}));
