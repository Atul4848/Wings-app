import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    modalDetail: {
      display: 'flex',
      paddingBottom: '20px',
    },
    mappedSection: {
      width: '50%',
      borderRight: `1px solid ${palette.divider}`,
      padding: '5px 10px',
    },
    mappedHeading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px',
    },
    modalHeading: {
      paddingBottom: '5px',
    },
    close: {
      minWidth: 30,
      padding: '1px 5px',
      marginLeft: '5px',
    },
    selectedMapped: {
      width: '50%',
      padding: '5px 10px',
    },
    selectMapped: { width: 200 },
    userMappedWidth: { width: 900, height: 375 },
    modalRoot: {
      '& div.MuiPaper-root': {
        background: palette.background.default,
      },
    },
    customLoader: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20%',
    },
  });
