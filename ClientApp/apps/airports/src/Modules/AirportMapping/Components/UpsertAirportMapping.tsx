import React, { ReactNode } from 'react';
import { BaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { withStyles } from '@material-ui/core';
import { fields } from './Fields';
import { styles } from './UpsertAirportMapping.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AirportMappingsModel, AirportMappingStore } from '../../Shared';
import { action, observable } from 'mobx';
import { takeUntil } from 'rxjs/operators';
import { IClasses, IOptionValue, UIStore, Utilities } from '@wings-shared/core';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  airportMappingsModel?: AirportMappingsModel;
  upsertMapping: (request: AirportMappingsModel) => void;
  airportMappingsStore?: AirportMappingStore;
};

@observer
class UpsertAirportMapping extends BaseUpsertComponent<Props, AirportMappingsModel> {
  @observable private isICAOExist: boolean = true;

  constructor(props: Props) {
    super(props, fields);
  }

  componentDidMount() {
    this.setFormValues(this.props?.airportMappingsModel as AirportMappingsModel);
  }

  /* istanbul ignore next */
  private validateIcaoCode(value: string) {
    this.props.airportMappingsStore
      ?.ValidateIcaoCode(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.isICAOExist = response;
      });
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    return {
      title: 'Airport Mapping',
      inputControls: [
        {
          fieldKey: 'icao',
          type: EDITOR_TYPES.TEXT_FIELD,
          customErrorMessage: this.isICAOExist ? '' : 'ICAO code is invalid',
        },
        {
          fieldKey: 'navblueCode',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'apgCode',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    };
  }

  private upsertMapping(): void {
    const { upsertMapping, airportMappingsModel } = this.props;
    const mapping = new AirportMappingsModel({ ...airportMappingsModel, ...this.form.values() });
    upsertMapping(mapping);
  }

  /* istanbul ignore next */
  @action
  protected onValueChange(value: IOptionValue | IOptionValue[], fieldKey: string): void {
    if (Utilities.isEqual(fieldKey, 'icao')) {
      if (value.toString().length == 4) {
        this.validateIcaoCode(value.toString());
      } else {
        this.isICAOExist = false;
      }
    }
    this.getField(fieldKey).set(value);
  }

  private get dialogContent(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <>
        {this.loader.spinner}
        <div className={classes.modalDetail}>
          {this.groupInputControls.inputControls.map((inputControl: IViewInputControl, index: number) => (
            <ViewInputControl
              {...inputControl}
              key={index}
              classes={{
                flexRow: classes.fullFlex,
              }}
              field={this.getField(inputControl.fieldKey || '')}
              isEditable={this.isEditable}
              onValueChange={option => this.onValueChange(option, inputControl.fieldKey || '')}
              customErrorMessage={inputControl.customErrorMessage}
              isLoading={inputControl.isLoading}
            />
          ))}
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => this.upsertMapping()}
              disabled={this.hasError}
            >
              Save
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  private get hasError(): boolean {
    return this.form.hasError || UIStore.pageLoading || !this.isICAOExist;
  }

  render(): ReactNode {
    const { classes, viewMode } = this.props as Required<Props>;
    return (
      <Dialog
        title={`${viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} Airport Mapping`}
        open={true}
        classes={{
          dialogWrapper: classes.modalRoot,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
      />
    );
  }
}

export default withStyles(styles)(UpsertAirportMapping);
export { UpsertAirportMapping as PureUpsertAirportMapping };
