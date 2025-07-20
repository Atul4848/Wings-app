import React, { ReactNode } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { Collapse, IconButton, withStyles } from '@material-ui/core';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import Alert, { Color } from '@material-ui/lab/Alert';
import { styles } from './UserWarning.styles';
import { ArrowBack } from '@material-ui/icons';
import { IClasses, UnsubscribableComponent } from '@wings-shared/core';
import { CustomLinkButton } from '@wings-shared/layout';

interface Props {
  classes: IClasses,
  message: string;
  severity: Color;
  userSubScriptionRoute: string;
}

@observer
class UserWarning extends UnsubscribableComponent<Props> {
  @observable private showWarning: boolean = true;

  render(): ReactNode {
    const { classes, message, severity, userSubScriptionRoute } = this.props;
    return (
      <>
        <Collapse in={this.showWarning}>
          <Alert
            severity={severity}
            action={
              <IconButton
                aria-label='close'
                color='inherit'
                size='medium'
                onClick={() => this.showWarning = false}
              >
                <CloseIcon fontSize='inherit' />
              </IconButton>
            }
          >
            {message}
          </Alert>
        </Collapse>
        <div className={classes.backBtn}>
          <CustomLinkButton
            to={userSubScriptionRoute}
            title='Go to User Subscriptions'
            startIcon={<ArrowBack />}
          />
        </div>
      </>
    )
  }
}

export default withStyles(styles)(UserWarning);
