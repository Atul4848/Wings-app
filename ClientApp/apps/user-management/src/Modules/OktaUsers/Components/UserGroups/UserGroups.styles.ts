import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    details: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: 6,
      alignItems: 'center',
      marginBottom: '15px',
      marginRight: '15px',
      borderRadius: '5px',
      width: '100%',
      flexBasis: '32%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      border: '1px solid #ddd',
    },
    subSection: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    pic: {
      marginRight: '6px',
    },
    groupName: {
      display: 'block',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      color: palette.grey.A700,
    },
    groupSection: {
      background: palette.background.paper,
      display: 'flex',
      flexWrap: 'wrap',
    },
  });
