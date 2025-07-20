import { BaseUpsertComponent, IBaseModuleProps, VIEW_MODE } from '@wings/shared';
import { withStyles } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { NavigateFunction } from 'react-router';
import { AirportFlightPlanInfoModel, AirportModel, AirportSettingsStore, AirportStore } from '../../../Shared';
import { AirportModuleSecurity } from '../../../Shared/Tools';
import { fields } from './Fields';
import { styles } from './FlightPlanInformation.styles';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { action } from 'mobx';
import {
  UIStore,
  Utilities,
  withRouter,
  IClasses,
  IOptionValue,
  GRID_ACTIONS,
  IAPIGridRequest,
  SEARCH_ENTITY_TYPE,
  baseEntitySearchFilters,
  ISelectOption,
  IdNameCodeModel,
} from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';

interface Props extends IBaseModuleProps {
  viewMode?: VIEW_MODE;
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  params?: { viewMode: VIEW_MODE; airportId: string };
  navigate: NavigateFunction;
  classes?: IClasses;
}

@inject('airportStore', 'airportSettingsStore')
@observer
export class FlightPlanInformation extends BaseUpsertComponent<Props, AirportFlightPlanInfoModel> {
  private readonly backNavLink: string = '/airports';

  constructor(p: Props) {
    super(p, fields, baseEntitySearchFilters);
    this.setViewMode((p.params?.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
  }

  /* istanbul ignore next */
  componentDidMount() {
    this.setFormValues(this.selectedAirport?.airportFlightPlanInfo);
  }

  /* istanbul ignore next */
  private get airportId(): number {
    return Utilities.getNumberOrNullValue(this.props.params?.airportId) as number;
  }

  /* istanbul ignore next */
  private get selectedAirport(): AirportModel {
    return this.props.airportStore?.selectedAirport as AirportModel;
  }

  /* istanbul ignore next */
  private get airportStore(): AirportStore {
    return this.props.airportStore as AirportStore;
  }

  /* istanbul ignore next */
  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  /* istanbul ignore next */
  private get disableSaveButton(): boolean {
    return this.form.hasError || UIStore.pageLoading || !this.form.changed || this.hasDuplicateValue;
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls[] {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'navBlueCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'apgCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'isACDMAirport',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'isEuroControlFPLACDMAirport',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'fplzzzz',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'fplzzzzItem18',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !this.getField('fplzzzz').value,
          },
          {
            fieldKey: 'isCompositeFlightPlanRequired',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'isVFRAirport',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'appliedDestAltTOFs',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.destinationAlternateTOFs,
            multiple: true,
          },
          {
            fieldKey: 'fpAirspace',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.fpAirspaceOptions,
          },
        ],
      },
    ];
  }

  /* istanbul ignore next */
  private upsertAirportFlightPlanInfo(): void {
    const values = this.form.values();
    const request = new AirportFlightPlanInfoModel({
      ...this.selectedAirport.airportFlightPlanInfo,
      ...values,
      airportId: this.airportId,
    });
    UIStore.setPageLoader(true);
    this.props.airportStore
      ?.upsertAirportFlightPlanInfo(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          this.props.airportStore?.setSelectedAirport({
            ...this.selectedAirport,
            airportFlightPlanInfo: response,
          });
          this.form.reset();
          this.setFormValues(response);
        },
        error: error => AlertStore.critical(error.message),
      });
  }

  @action
  protected onSearch(searchValue: string, fieldKey: string): void {
    if (fieldKey === 'fpAirspace') {
      const request: IAPIGridRequest = this.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.FIR);
      this.observeSearch(this.airportStore.getFIRs(request));
      return;
    }
  }

  @action
  protected onFocus(fieldKey: string): void {
    if (fieldKey === 'appliedDestAltTOFs') {
      this.observeSearch(this.airportSettingsStore.loadDestinationAlternateTOFs());
      return;
    }
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);

    if (Utilities.isEqual(fieldKey, 'fplzzzz')) {
      this.getField('fplzzzzItem18').clear();
    }
  }

  /* istanbul ignore next */
  private get fpAirspaceOptions(): ISelectOption[] {
    return this.airportStore.firs.map(fir => new IdNameCodeModel({ ...fir }));
  }

  private onAction(action: GRID_ACTIONS): void {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        this.upsertAirportFlightPlanInfo();
        break;
      case GRID_ACTIONS.EDIT:
        this.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(this.props.params?.viewMode || '', VIEW_MODE.DETAILS)) {
          this.form.reset();
          this.setFormValues(this.selectedAirport?.airportFlightPlanInfo);
          this.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        this.props.navigate(this.backNavLink, this.noBlocker);
        break;
    }
  }

  private get headerActions(): ReactNode {
    return (
      <DetailsEditorHeaderSection
        title={this.selectedAirport.title}
        backNavLink={this.backNavLink}
        backNavTitle="Airports"
        disableActions={this.disableSaveButton}
        isEditMode={this.isEditable}
        isActive={this.selectedAirport?.isActive}
        hasEditPermission={AirportModuleSecurity.isEditable}
        onAction={action => this.onAction(action)}
      />
    );
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <ConfirmNavigate isBlocker={this.form.changed}>
        <DetailsEditorWrapper
          headerActions={this.headerActions}
          isEditMode={this.isEditable}
          classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
        >
          <ViewInputControlsGroup
            groupInputControls={this.groupInputControls}
            field={fieldKey => this.getField(fieldKey)}
            isEditing={this.isEditable}
            isLoading={this.loader.isLoading}
            onValueChange={(option: IOptionValue, fieldKey: string) => this.onValueChange(option, fieldKey)}
            onSearch={(searchValue, fieldKey) => this.onSearch(searchValue, fieldKey)}
            onFocus={fieldKey => this.onFocus(fieldKey)}
          />
        </DetailsEditorWrapper>
      </ConfirmNavigate>
    );
  }
}

export default withRouter(withStyles(styles)(FlightPlanInformation));
export { FlightPlanInformation as PureFlightPlanInformation };
