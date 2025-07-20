import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ spacing }: Theme) =>
  createStyles({
    titleWrapperContent: {
      padding: spacing(2),
      height: 'calc(100% - 65px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    addHoursContainer: {
      display: 'flex',
      justifyContent: 'end',
      marginBottom: spacing(1),
    },
    gridWrapper: {
      height: '100%',
    },
    headerActions: {
      justifyContent: 'flex-start',
    },
    iconButton:{
      '&.MuiIconButton-root':{
        padding: '2px 12px',
      },
    },  
  });

export const useStyles = makeStyles(({ spacing }: Theme) => ({
  titleWrapperContent: {
    padding: spacing(2),
    height: 'calc(100% - 65px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  addHoursContainer: {
    display: 'flex',
    justifyContent: 'end',
    marginBottom: spacing(1),
  },
  gridWrapper: {
    height: '100%',
  },
  headerActions: {
    justifyContent: 'flex-start',
  },
  iconButton: {
    '&.MuiIconButton-root': {
      padding: '2px 12px',
    },
  },
}));
