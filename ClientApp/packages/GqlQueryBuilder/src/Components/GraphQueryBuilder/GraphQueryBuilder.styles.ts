import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(
  theme => ({
    root: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      '& .group-or-rule': {
        '&.group': {
          background: theme.palette.background.default,
          borderColor: theme.palette.divider,
          padding: '0 10px',
          height: '100%',
        },
        '&.rule': {
          boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
          padding: '5px',

          '& .rule--header': {
            '& button': {
              color: theme.palette.error.light,
            },
          },
        },
        '& .group--conjunctions': {
          '& button:not([class*=MuiButton-containedPrimary])': {
            backgroundColor: theme.palette.grey[500],
          },
        },
      },
      '& .group--children.hide--line > .group-or-rule-container > .group-or-rule::before': {
        borderColor: theme.palette.divider,
      },
      '& .group--header:not(.no--children):not(.hide--conjs).hide--line::before': {
        borderColor: theme.palette.divider,
      },
      '& .group-or-rule-container': {
        paddingRight: 0,
      },
    },
    searchButton: {
      flexShrink: 0,
    },
    inputs: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '10px',
      paddingRight: '10px',
    },
    autoComplete: {
      flex: 1,
    },
  }),
  { name: 'graph-query-builder' }
);
