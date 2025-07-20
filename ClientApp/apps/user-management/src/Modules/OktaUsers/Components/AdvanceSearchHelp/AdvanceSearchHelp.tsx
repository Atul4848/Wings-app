import { Link, Typography, withStyles, Card, CardContent } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { styles } from './AdvanceSearchHelp.styles';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IClasses, UnsubscribableComponent } from '@wings-shared/core';

type Props = {
  classes: IClasses;
};

class AdvanceSearchHelp extends UnsubscribableComponent<Props> {
  constructor(p: Props) {
    super(p);
  }

  private get dialogContent(): ReactNode {
    const { classes } = this.props;
    return (
      <>
        <div className={classes.modaldetail}>
          <Typography variant="subtitle1" component="h2">
            Please click here for more info.
          </Typography>
          <Link underline="hover" target="_blank" href="https://developer.okta.com/docs/reference/core-okta-api/#operators">Learn More</Link>
        </div>
        <div>
          <Card variant="outlined" className={classes.cardContainer}>
            <CardContent className={classes.formContainer}>
              <div className={classes.formSection}>
                <Typography variant="subtitle1" component="h2">
                  Sample search's:
                </Typography>
                <ul>
                  <li>profile.firstName eq "Grant" and profile.customerNumber eq "32590"</li>
                  <li>profile.firstName sw "B" and profile.customerNumber eq "32590"</li>
                  <li>profile.preferences eq "TripFilter:Future"</li>
                  <li>profile.firstName sw "G" and status eq "ACTIVE"</li>
                  <li>profile.firstName sw "Robert" and profile.isInternalUser eq true</li>
                  <li>profile.firstName sw "Robert" and (profile.isInternalUser eq true and profile.csdUserId gt 0)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  public render(): ReactNode {
    const { classes } = this.props;
    return (
      <Dialog
        title='Advance Help Search'
        open={true}
        classes={{
          dialogWrapper: classes.modalRoot,
          paperSize: classes.userGroupWidth,
          header: classes.headerWrapper,
          content: classes.content,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
      />
    );
  }
}
export default withStyles(styles)(AdvanceSearchHelp);
