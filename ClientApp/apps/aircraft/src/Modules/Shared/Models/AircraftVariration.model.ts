import { IAPIAircraftVariation, IAPIAircraftVariationSTCManufacture } from '../Interfaces';
import { CoreModel, ISelectOption, Utilities, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { TypeDesignatorModel } from './TypeDesignator.model';

@modelProtection
export class AircraftVariationModel extends CoreModel implements ISelectOption {
  id: number = 0;
  numberOfEngines: number = null;
  otherNames: SettingsTypeModel[];
  receivedDate: string = '';
  receivedBy: string = '';
  requestedDate: string = '';
  requestedBy: string = '';
  cappsModel: string = '';
  cappsEngineType: string = '';
  cappsCruiseSchedule: string = '';
  minimumRunwayLength: number = null;
  range: number = null;
  isManufactureDataLicense: boolean = false;
  manufactureDataLicenseStartDate: string = '';
  manufactureDataLicenseEndDate: string = '';
  comments: string = '';
  maxCrosswind: number = null;
  maxTailWind: number = null;
  isPermissionToLoadRequired: boolean = false;
  wingspan: number = null;
  make: SettingsTypeModel;
  model: SettingsTypeModel;
  performances: SettingsTypeModel[];
  series: SettingsTypeModel;
  engineType: SettingsTypeModel;
  stcManufactures: SettingsTypeModel[];
  icaoTypeDesignator: TypeDesignatorModel;
  propulsionType: SettingsTypeModel;
  fuelType: SettingsTypeModel;
  category: SettingsTypeModel;
  subCategory: SettingsTypeModel;
  fireCategory: SettingsTypeModel;
  wakeTurbulenceCategory: SettingsTypeModel;
  distanceUOM: SettingsTypeModel;
  rangeUOM: SettingsTypeModel;
  windUOM: SettingsTypeModel;
  pictureUrl: string;
  pictureAccessTokenUrl: string;
  cappsSeries: string;
  cappsRecordId?: string;
  isUwaFlightPlanSupported: boolean = false;
  modifications: SettingsTypeModel[];
  popularNames: SettingsTypeModel[];
  isVerificationComplete: boolean = false;
  militaryDesignations: SettingsTypeModel[];

  constructor(data?: Partial<AircraftVariationModel>) {
    super(data);
    Object.assign(this, data);
    this.make = data?.make ? new SettingsTypeModel(data?.make) : null;
    this.model = data?.model ? new SettingsTypeModel(data?.model) : null;
    this.performances = data?.performances?.map(x => new SettingsTypeModel(x)) || [];
    this.otherNames = data?.otherNames?.map(x => new SettingsTypeModel(x)) || [];
    this.series = data?.series ? new SettingsTypeModel(data?.series) : null;
    this.engineType = new SettingsTypeModel(data?.engineType);
    this.modifications = data?.modifications?.map(x => new SettingsTypeModel(x)) || [];
    this.icaoTypeDesignator = new TypeDesignatorModel(data?.icaoTypeDesignator);
    this.fuelType = data?.fuelType ? new SettingsTypeModel(data?.fuelType) : null;
    this.category = data?.category ? new SettingsTypeModel(data?.category) : null;
    this.subCategory = data?.subCategory ? new SettingsTypeModel(data?.subCategory) : null;
    this.fireCategory = data?.fireCategory ? new SettingsTypeModel(data?.fireCategory) : null;
    this.wakeTurbulenceCategory = data?.wakeTurbulenceCategory
      ? new SettingsTypeModel(data?.wakeTurbulenceCategory)
      : null;
    this.distanceUOM = data?.distanceUOM ? new SettingsTypeModel(data?.distanceUOM) : null;
    this.rangeUOM = data?.rangeUOM ? new SettingsTypeModel(data?.rangeUOM) : null;
    this.windUOM = data?.windUOM ? new SettingsTypeModel(data?.windUOM) : null;
    this.stcManufactures = data?.stcManufactures?.map(x => new SettingsTypeModel(x)) || [];
    this.popularNames = data?.popularNames?.map(x => new SettingsTypeModel(x)) || [];
    this.militaryDesignations = data?.militaryDesignations?.map(x => new SettingsTypeModel(x)) || [];
  }

  static deserialize(apiData: IAPIAircraftVariation): AircraftVariationModel {
    if (!apiData) {
      return new AircraftVariationModel();
    }
    const data: Partial<AircraftVariationModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.aircraftVariationId || apiData.id,
      make: SettingsTypeModel.deserialize({ ...apiData.make, id: apiData.make?.makeId }),
      model: SettingsTypeModel.deserialize({ ...apiData.model, id: apiData.model?.modelId }),
      performances: apiData.aircraftVariationPerformances?.map(x =>
        SettingsTypeModel.deserialize({ ...x.performance, id: x?.performance?.performanceId })
      ),
      otherNames: apiData.aircraftVariationOtherNames?.map(x =>
        SettingsTypeModel.deserialize({ ...x.otherName, id: x?.otherName?.otherNameId })
      ),
      popularNames: apiData.aircraftVariationPopularNames?.map(x =>
        SettingsTypeModel.deserialize({ ...x.popularName, id: x?.popularName?.popularNameId })
      ),
      series: SettingsTypeModel.deserialize({ ...apiData.series, id: apiData.series?.seriesId }),
      engineType: SettingsTypeModel.deserialize({ ...apiData.engineType, id: apiData.engineType?.engineTypeId }),
      modifications:
        apiData.aircraftVariationModifications?.map(x =>
          SettingsTypeModel.deserialize({
            ...x.aircraftModification,
            id: x.aircraftModification?.aircraftModificationId,
          })
        ) || [],
      icaoTypeDesignator: TypeDesignatorModel.deserialize(apiData.icaoTypeDesignator),
      propulsionType: SettingsTypeModel.deserialize({
        ...apiData.icaoTypeDesignator?.propulsionType,
        id: apiData.icaoTypeDesignator?.propulsionType?.propulsionTypeId,
      }),
      fuelType: SettingsTypeModel.deserialize({ ...apiData.fuelType, id: apiData.fuelType?.fuelTypeId }),
      category: SettingsTypeModel.deserialize({ ...apiData.category, id: apiData.category?.categoryId }),
      subCategory: SettingsTypeModel.deserialize({ ...apiData.subCategory, id: apiData.subCategory?.subCategoryId }),
      fireCategory: SettingsTypeModel.deserialize({
        ...apiData.fireCategory,
        id: apiData.fireCategory?.fireCategoryId,
      }),
      wakeTurbulenceCategory: SettingsTypeModel.deserialize({
        ...apiData.wakeTurbulenceCategory,
        id: apiData.wakeTurbulenceCategory?.wakeTurbulenceCategoryId,
      }),
      distanceUOM: SettingsTypeModel.deserialize({ ...apiData.distanceUOM, id: apiData.distanceUOM?.distanceUOMId }),
      rangeUOM: SettingsTypeModel.deserialize({ ...apiData.rangeUOM, id: apiData.rangeUOM?.rangeUOMId }),
      windUOM: SettingsTypeModel.deserialize({ ...apiData.windUOM, id: apiData.windUOM?.windUOMId }),
      stcManufactures:
        (apiData.aircraftVariationSTCManufactures as IAPIAircraftVariationSTCManufacture[])?.map(x =>
          SettingsTypeModel.deserialize({ ...x, id: x.stcManufacture?.stcManufactureId, name: x.stcManufacture?.name })
        ) || [],
      militaryDesignations: apiData.aircraftVariationMilitaryDesignations?.map(x =>
        SettingsTypeModel.deserialize({ ...x.militaryDesignation, id: x.militaryDesignation?.militaryDesignationId })
      ),
    };
    return new AircraftVariationModel(data);
  }

  public serialize(): IAPIAircraftVariation {
    return {
      id: this.id,
      name: this.name,
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id || 1,
      numberOfEngines: Utilities.getNumberOrNullValue(this.numberOfEngines),
      aircraftVariationOtherNameIds: this.otherNames?.map(x => x.id),
      minimumRunwayLength: Utilities.getNumberOrNullValue(this.minimumRunwayLength),
      range: Utilities.getNumberOrNullValue(this.range),
      isManufactureDataLicense: this.isManufactureDataLicense,
      manufactureDataLicenseStartDate: this.manufactureDataLicenseStartDate || null,
      manufactureDataLicenseEndDate: this.manufactureDataLicenseEndDate || null,
      maxCrosswind: Utilities.getNumberOrNullValue(this.maxCrosswind),
      maxTailWind: Utilities.getNumberOrNullValue(this.maxTailWind),
      isPermissionToLoadRequired: this.isPermissionToLoadRequired,
      engineTypeId: this.engineType?.id,
      aircraftVariationPerformanceIds: this.performances?.map(x => x.id),
      icaoTypeDesignatorId: this.icaoTypeDesignator?.id,
      fuelTypeId: this.fuelType?.id,
      subCategoryId: this.subCategory?.id,
      fireCategoryId: this.fireCategory?.id,
      wakeTurbulenceCategoryId: this.wakeTurbulenceCategory?.id,
      distanceUOMId: this.distanceUOM?.id,
      rangeUOMId: this.rangeUOM?.id,
      windUOMId: this.windUOM?.id,
      wingspan: Utilities.getNumberOrNullValue(this.wingspan),
      comments: this.comments,
      makeId: this.make?.id,
      modelId: this.model?.id,
      categoryId: this.category?.id,
      seriesId: this.series?.id,
      pictureUrl: this.pictureUrl,
      aircraftVariationSTCManufactures: this.stcManufactures?.map(x => x.id),
      aircraftVariationModificationIds: this.modifications?.map(x => x.id),
      cappsCruiseSchedule: this.cappsCruiseSchedule,
      // make it hidden as per 75877
      cappsEngineType: null,
      cappsModel: null,
      cappsSeries: null,
      isUwaFlightPlanSupported: this.isUwaFlightPlanSupported,
      aircraftVariationPopularNameIds: this.popularNames?.map(x => x.id),
      isVerificationComplete: this.isVerificationComplete,
      aircraftVariationMilitaryDesignationIds: this.militaryDesignations?.map(x => x.id),
    };
  }

  static deserializeList(apiDataList: IAPIAircraftVariation[]): AircraftVariationModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAircraftVariation) => AircraftVariationModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return [
      this.icaoTypeDesignator?.label,
      this.make?.label,
      this.model?.label,
      this.series?.label,
      this.engineType?.label,
    ]
      .filter(x => x)
      .join('_');
  }

  public get value(): string | number {
    return this.id;
  }
}
