import { createStyles, makeStyles } from '@material-ui/core';
import { ITheme } from '@wings-shared/core';

export const styles = ({ palette, spacing }: ITheme) =>
  createStyles({
    editorWrapperContainer: {
      overflow: 'auto',
    },
    headerActionsEditMode: {
      justifyContent: 'space-between',
    },
    buttonStyle: {
      color: palette.primary.main,
      cursor: 'pointer',
    },
    imageIcon: {
      height: '15px',
      width: '15px',
      cursor: 'pointer',
      color: palette.primary.main,
      pointerEvents: 'all',
      float: 'right',
    },
    picture: {
      width: '300px',
    },
    containerClass: {
      paddingTop: '23px',
    },
    iFrame: {
      width: '100%',
      height: '100%',
    },
    content: {
      height: '600px',
      width: '100%',
      overflowY: 'hidden',
    },
    modalWidth: {
      width: '900px',
      maxHeight: 'calc(100% - 20px)',
    },
  });

export const useStyles = makeStyles(({ palette, spacing }: ITheme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  buttonStyle: {
    color: palette.primary.main,
    cursor: 'pointer',
  },
  imageIcon: {
    height: '15px',
    width: '15px',
    cursor: 'pointer',
    color: palette.primary.main,
    pointerEvents: 'all',
    float: 'right',
  },
  picture: {
    width: '300px',
  },
  containerClass: {
    paddingTop: '23px',
  },
  iFrame: {
    width: '100%',
    height: '100%',
  },
  content: {
    height: '600px',
    width: '100%',
    overflowY: 'hidden',
  },
  modalWidth: {
    width: '900px',
    maxHeight: 'calc(100% - 20px)',
  },
}));
