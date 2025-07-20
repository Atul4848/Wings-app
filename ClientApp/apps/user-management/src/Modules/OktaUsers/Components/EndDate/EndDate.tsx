import { withStyles } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { styles } from './EndDate.style';
import { UserResponseModel, UserStore } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import moment from 'moment';
import { DATE_FORMAT, DATE_TIME_PICKER_TYPE, IClasses, Loader, UnsubscribableComponent } from '@wings-shared/core';
import { DateTimePicker } from '@wings-shared/form-controls';

type Props = {
  classes: IClasses;
  user: UserResponseModel;
  userStore?: UserStore;
  updateEndDate: (selectedDate: string) => void;
};

@inject('userStore')
@observer
class EndDate extends UnsubscribableComponent<Props> {
  @observable private loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
  @observable private selectedEndDate: string = '';

  constructor(props) {
    super(props);
    this.selectedEndDate = props.user.endDate;
  }

  /* istanbul ignore next */
  private get isValidDate(): boolean {
    return Boolean(this.selectedEndDate?.length);
  }

  /* istanbul ignore next */
  private get minDate(): string {
    return moment().format(DATE_FORMAT.API_DATE_FORMAT);
  }

  /* istanbul ignore next */
  private get dialogContent(): ReactNode {
    const { classes, updateEndDate } = this.props;
    return (
      <>
        {this.loader.spinner}
        <div className={classes.modalDetail}>
          <label>End Date:</label>
          <DateTimePicker
            pickerType={DATE_TIME_PICKER_TYPE.DATE}
            format={DATE_FORMAT.API_DATE_FORMAT}
            value={this.selectedEndDate}
            placeholder="Enter end date"
            minDate={this.minDate}
            onChange={(value: string, date: Date) => this.onChange(value, date)}
          />
          <PrimaryButton
            variant="contained"
            color="primary"
            disabled={!this.isValidDate}
            onClick={() => updateEndDate(this.selectedEndDate)}
          >
            Submit
          </PrimaryButton>
        </div>
      </>
    );
  }

  /* istanbul ignore next */
  @action
  private onChange(value: string, date: any): void {
    this.selectedEndDate = date ? date.format(DATE_FORMAT.API_DATE_FORMAT) : null;
  }

  public render(): ReactNode {
    const { classes, user } = this.props;
    return (
      <Dialog
        title={`Update end date for: ${user?.username}`}
        open={true}
        classes={{
          dialogWrapper: classes.modalRoot,
          paperSize: classes.userMappedWidth,
          header: classes.headerWrapper,
          content: classes.content,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
      />
    );
  }
}

export default withStyles(styles)(EndDate);
