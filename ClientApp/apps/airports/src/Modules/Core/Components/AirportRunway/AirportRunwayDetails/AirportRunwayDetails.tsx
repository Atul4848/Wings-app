import React, { ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl } from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import { withStyles, Typography } from '@material-ui/core';
import { styles } from './AirportRunwayDetails.styles';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { action, observable } from 'mobx';
import classNames from 'classnames';
import AirportRunwayDetailsBase, { BaseProps } from './AirportRunwayDetailsBase';
import {
  AirportRunwayModel,
  RunwayDetailModel,
  AirportModuleSecurity,
  AirportModel,
  updateAirportSidebarOptions,
} from '../../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import PrimaryRunwayEditor from './PrimaryRunwayEditor';
import { IOptionValue, UIStore, Utilities, withRouter, GRID_ACTIONS, IClasses } from '@wings-shared/core';
import {
  DetailsEditorWrapper,
  ConfirmNavigate,
  ConfirmDialog,
  Collapsable,
  DetailsEditorHeaderSection,
} from '@wings-shared/layout';

@inject('airportStore', 'airportSettingsStore', 'sidebarStore')
@observer
class AirportRunwayDetails extends AirportRunwayDetailsBase<BaseProps> {
  @observable runway: AirportRunwayModel = new AirportRunwayModel();

  constructor(p: BaseProps) {
    super(p);
    this.viewMode = this.props.params?.runwayViewMode || VIEW_MODE.EDIT;
  }

  componentDidMount() {
    if (this.props.params) {
      const { airportId, icao } = this.props.params;
      this.props.sidebarStore?.setNavLinks(
        updateAirportSidebarOptions('Runways', window.location.search,!Boolean(airportId)),
        `/airports/upsert/${airportId}/${icao}/${this.props.viewMode}`
      );
    }
    this.loadData();
  }

  @action
  private loadData(): void {
    if (!this.props.params?.runwayId) {
      this.setFormValues(this.runway);
      return;
    }
    const { runways } = this.airportStore.selectedAirport as AirportModel;
    this.runway = runways.find(a => a.id === Number(this.props.params?.runwayId)) as AirportRunwayModel;
    this.setFormValues(this.runway);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.airportStore.clearRunways();
  }

  @action
  protected onValueChange(value: IOptionValue | IOptionValue[], fieldKey: string): void {
    this.getField(fieldKey).set(value);
  }

  /* istanbul ignore next */
  private onFocus(fieldKey: string): void {
    switch (fieldKey) {
      case 'runwaySurfaceTreatment':
        this.observeSearch(this.airportSettingsStore.loadRunwaySurfaceTreatments());
        break;
      case 'runwaySurfacePrimaryType':
      case 'runwaySurfaceSecondaryType':
        this.observeSearch(this.airportSettingsStore.loadRunwaySurfaceTypes());
        break;
      case 'runwayLightType':
        this.observeSearch(this.airportSettingsStore.loadRunwayLightTypes());
        break;
      case 'runwayCondition':
        this.observeSearch(this.airportSettingsStore.loadRunwayConditions());
        break;
      case 'runwayUsageType':
        this.observeSearch(this.airportSettingsStore.loadRunwayUsageTypes());
        break;
      case 'appliedRunwayRVRs':
        this.observeSearch(this.airportSettingsStore.loadRunwayRVR());
        break;
      case 'runwayApproachLight':
        this.observeSearch(this.airportSettingsStore.loadRunwayApproachLight());
        break;
      case 'runwayVGSI':
        this.observeSearch(this.airportSettingsStore.loadRunwayVGSI());
        break;
      case 'appliedRunwayApproachTypes':
        this.observeSearch(this.airportSettingsStore.loadRunwayApproachType());
        break;
      case 'appliedRunwayNavaids':
        this.observeSearch(this.airportSettingsStore.loadRunwayNavaids());
        break;
      case 'accessLevel':
        this.observeSearch(this.airportSettingsStore.getAccessLevels());
        break;
      case 'sourceType':
        this.observeSearch(this.airportSettingsStore.getSourceTypes());
        break;
    }
  }

  private onAction(action: GRID_ACTIONS) {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        this.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        this.upsertRunway();
        break;
      case GRID_ACTIONS.CANCEL:
        this.confirmClose();
        break;
    }
  }

  @action
  protected onCancel(): void {
    const viewMode = this.props.params?.runwayViewMode.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      this.viewMode = VIEW_MODE.DETAILS;
      this.form.reset();
      this.setFormValues(this.runway);
      return;
    }
    this.navigateToRunways();
  }

  /* istanbul ignore next */
  private navigateToRunways(): void {
    if (this.props.params) {
      const { airportId, icao } = this.props.params;
      this.props.navigate &&
        this.props.navigate(`/airports/upsert/${airportId}/${icao}/${this.props.viewMode}/runway`, this.noBlocker);
        this.props.sidebarStore?.setNavLinks(
          updateAirportSidebarOptions('Runways', window.location.search,!Boolean(airportId)),
          `/airports/upsert/${airportId}/${icao}/${this.props.viewMode}`
        );
    }
  }

  private confirmClose(): void {
    const viewMode = this.props.params?.runwayViewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      if (!this.form.touched) {
        this.onCancel();
        return;
      }
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Cancellation"
          message="Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?"
          yesButton="Yes"
          onNoClick={() => {
            ModalStore.close();
          }}
          onYesClick={() => {
            this.onCancel();
            ModalStore.close();
          }}
        />
      );
      return;
    }
    this.navigateToRunways();
    return;
  }

  /* istanbul ignore next */
  private isValidData(data: AirportRunwayModel): boolean {
    const { runways } = this.airportStore.selectedAirport as AirportModel;
    const { base, reciprocal, id, runwayId } = data;
    const isDuplicateId = runways.some(x => Utilities.isEqual(x.runwayId, runwayId) && !Utilities.isEqual(x.id, id));
    if (isDuplicateId) {
      this.showAlert('Runway ID should be unique in Airport', 'Runway');
      return false;
    }
    const isDuplicate = runways.some(
      x =>
        (Utilities.isEqual(x.base.runwayNumber, base.runwayNumber) ||
          Utilities.isEqual(x.reciprocal.runwayNumber, reciprocal.runwayNumber)) &&
        !Utilities.isEqual(x.id, id)
    );
    if (isDuplicate) {
      this.showAlert('Runway Number should be unique in Airport', 'Runway');
      return false;
    }
    return true;
  }

  /* istanbul ignore next */
  private upsertRunway(): void {
    const airportId = this.props.params?.airportId as number;
    const { reciprocal, base, ...rest } = this.form.values();
    const data = new AirportRunwayModel({
      ...rest,
      id: Utilities.getNumberOrNullValue(this.runway.id),
      airportId,
      base: new RunwayDetailModel({ ...this.runway.base, ...base, runwayTypeId: 1 }),
      reciprocal: new RunwayDetailModel({ ...this.runway.reciprocal, ...reciprocal, runwayTypeId: 2 }),
    });
    if (!this.isValidData(data)) {
      return;
    }
    UIStore.setPageLoader(true);
    this.airportStore
      .upsertRunway(airportId, data)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          this.setViewMode(VIEW_MODE.DETAILS);
          this.form.reset();
          this.setFormValues(response);
          this.runway = response;
          this.setSelectedAirport(response, !Boolean(data.id));
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  private openPrimaryRunwayEditor(): void {
    ModalStore.open(<PrimaryRunwayEditor airportStore={this.airportStore} />);
  }

  private setSelectedAirport(updatedRunway: AirportRunwayModel, isNew: boolean): void {
    const { selectedAirport } = this.airportStore;
    const { runways, primaryRunway, ...rest } = selectedAirport as AirportModel;
    const updatedRunways: AirportRunwayModel[] = isNew
      ? [ ...runways, updatedRunway ]
      : runways.map(a => (a.id === updatedRunway.id ? updatedRunway : a));
    const updatedPrimaryRunway = updatedRunways.find(a => a.id === primaryRunway.id);
    this.airportStore.setSelectedAirport(
      new AirportModel({ ...rest, runways: updatedRunways, primaryRunway: updatedPrimaryRunway || primaryRunway })
    );
    this.openPrimaryRunwayEditor();
  }

  private get headerActions(): ReactNode {
    const { params, classes } = this.props as Required<BaseProps>;
    const { airportId, icao } = params;
    return (
      <DetailsEditorHeaderSection
        title={this.airportStore.selectedAirport?.title}
        backNavTitle="Countries Details"
        disableActions={this.form.hasError || UIStore.pageLoading || !this.form.changed}
        isEditMode={this.isEditable}
        onAction={action => this.onAction(action)}
        // backNavLink={`/${historyBasePath.current}`}
        hasEditPermission={Boolean(AirportModuleSecurity.isEditable && this.airportStore.selectedAirport?.isActive)}
        showBreadcrumb={true}
      />
    );
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <ConfirmNavigate isBlocker={this.form.touched}>
        <DetailsEditorWrapper
          headerActions={this.headerActions}
          isEditMode={this.isEditable}
          classes={{ container: classes.editorWrapperContainer }}
          isBreadCrumb={true}
        >
          <div className={classes.flexRow}>
            {this.groupInputControls
              .filter(groupInputControl => !groupInputControl.isHidden)
              .map(groupInputControl => {
                return (
                  <Collapsable key={groupInputControl.title} title={groupInputControl.title}>
                    <div className={classes.flexWrap}>
                      {groupInputControl.inputControls
                        .filter(inputControl => !inputControl.isHidden)
                        .map((inputControl: IViewInputControl, index: number) => {
                          return (
                            <ViewInputControl
                              {...inputControl}
                              key={index}
                              customErrorMessage={inputControl.customErrorMessage}
                              field={this.getField(inputControl.fieldKey || '')}
                              isEditable={this.isEditable}
                              isExists={inputControl.isExists}
                              classes={{
                                flexRow: classNames({
                                  [classes.inputControl]: true,
                                  [classes.labelFields]: inputControl.type === EDITOR_TYPES.LABEL,
                                }),
                              }}
                              onValueChange={(option, fieldKey) =>
                                this.onValueChange(option, inputControl.fieldKey || '')
                              }
                              onFocus={fieldKey => this.onFocus(fieldKey)}
                              showLabel={inputControl.showLabel}
                            />
                          );
                        })}
                    </div>
                  </Collapsable>
                );
              })}
          </div>
        </DetailsEditorWrapper>
      </ConfirmNavigate>
    );
  }
}

export default withRouter(withStyles(styles)(AirportRunwayDetails));
export { AirportRunwayDetails as PureAirportRunwayDetails };
