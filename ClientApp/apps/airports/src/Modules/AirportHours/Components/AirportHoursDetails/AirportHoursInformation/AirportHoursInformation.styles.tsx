import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    root: {
      maxHeight: 150,
    },
    informationArea: {
      width: '65%',
      maxHeight: 80,
      overflowY: 'auto',
    },
    tabPanel: {
      padding: 0,
      paddingTop: spacing(2),
    },
    evenRow: {
      backgroundColor: palette.grey['A400'],
    },
    rowWrapper: {
      display: 'flex',
      flexDirection: 'row',
    },
    flexRow: {
      flex: 1,
    },
    border: {
      borderLeftColor: palette.divider,
      borderLeftStyle: 'solid',
      borderLeftWidth: 1,
      '& p': {
        marginLeft: spacing(0.5),
      },
    },
    hourType: {
      flexBasis: '20%',
    },
  });

export const useStyles = makeStyles(({ palette, spacing }: Theme) => ({
  root: {
    maxHeight: 150,
  },
  informationArea: {
    width: '65%',
    maxHeight: 80,
    overflowY: 'auto',
  },
  tabPanel: {
    padding: 0,
    paddingTop: spacing(2),
  },
  evenRow: {
    backgroundColor: palette.grey['A400'],
  },
  rowWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  flexRow: {
    flex: 1,
  },
  border: {
    borderLeftColor: palette.divider,
    borderLeftStyle: 'solid',
    borderLeftWidth: 1,
    '& p': {
      marginLeft: spacing(0.5),
    },
  },
  hourType: {
    flexBasis: '20%',
  },
}));
