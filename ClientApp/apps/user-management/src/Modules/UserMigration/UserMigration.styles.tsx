import { makeStyles } from '@material-ui/core/styles';
import { colors } from 'material-ui/styles';

export const styles = makeStyles(({ palette }) => ({
  mainroot: {
    display: 'flex',
    height: 'calc(100vh - 190px)',
    width: '100%',
  },
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    padding: 15,
    width: '100%',
    minHeight: 195,
    height: 'calc(100vh - 120px)',
    marginRight: 15,
    background: palette.background.default,
  },
  contentSubContainer: {
    width: '30%',
  },
  userRow: {
    display: 'flex',
    justifyContent: 'space-between',
    background: palette.background.paper,
    padding: '15px',
  },
  cardContainer: {
    marginBottom: 10,
    cursor: 'pointer',
    display: 'flex',
  },
  noData: {
    display: 'flex',
    justifyContent: 'center',
  },
  listCategory: {
    display: 'flex',
  },
  listCategoryBox: {
    width: '100%',
  },
  inputControlField: {
    alignItems: 'baseline',
    flexBasis: '100%',
  },
  listCategoryBoxInner: {
    border: '1px solid #cbcdd5',
    display: 'flex',
    flexWrap: 'wrap',
    background: palette.background.paper,
    borderRadius: '4px',
    padding: '10px 10px 10px',
    margin: '10px 0',
  },
  bulletIcon: {
    fontSize: '1.10rem',
  },
  userMessagesContainer: {
    border: '1px solid #cbcdd5',
    display: 'flex',
    flexWrap: 'wrap',
    background: palette.background.default,
    borderRadius: '4px',
    padding: '10px 10px 10px',
    margin: '10px 0 0',
    height: '200px',
  },
  userMessages: {
    display: 'flex',
    alignItems: 'start',
    gap: '12px',
    color: palette.success.dark,
  },
  userWarningMessages: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: palette.error.light,
  },
  userMessagesBox: {
    display: 'flex',
    flexWrap: 'wrap',
    borderRadius: '4px',
    margin: '10px 0 0',
    height: 'auto',
  },
  oktaContainerBox: {
    padding: 15,
    width: '100%',
    minHeight: 457,
    height: 'calc(100vh - 120px)',
    overflowY: 'auto',
    marginRight: 5,
    background: palette.background.default,
  },
  emptyBoxContainer: {
    display: 'flex',
    justifyContent: 'center',
    '& div':{
      height: 50,
      width: 40,
      marginBottom: 10,
      color: '#B3B3B3',
    },
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: 'calc(100vh - 220px)',
  },
}));
