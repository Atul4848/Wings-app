import { baseApiPath, SettingsBaseStore } from '@wings/shared';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IAPIAesModel,
  IAPIAcarsMessageSet,
  IAPIAcarsModel,
  IAPIFmsModel,
  IAPIAcarsSoftwareVersion,
  IAPIFmsSoftwareVersion,
} from '../Interfaces';
import {
  AesModel,
  AcarsMessageSetModel,
  AcarsModel,
  FmsModel,
  AcarsSoftwareVersionModel,
  FmsSoftwareVersionModel,
} from '../Models';
import { apiUrls } from './API.url';
import { tapWithAction, Utilities, SettingsTypeModel } from '@wings-shared/core';

export class AvionicsSettingsStore extends SettingsBaseStore {
  @observable public acarsManufacturers: SettingsTypeModel[] = [];
  @observable public acarsModels: AcarsModel[] = [];
  @observable public fmsManufacturers: SettingsTypeModel[] = [];
  @observable public acarsSoftwareVersions: AcarsSoftwareVersionModel[] = [];
  @observable public aesManufacturers: SettingsTypeModel[] = [];
  @observable public fmsModels: FmsModel[] = [];
  @observable public acarsMessageSets: AcarsMessageSetModel[] = [];
  @observable public aesModels: AesModel[] = [];
  @observable public raimReportTypes: SettingsTypeModel[] = [];
  @observable public fmsSoftwareVersions: FmsSoftwareVersionModel[] = [];
  @observable public nfpFuelReserveTypes: SettingsTypeModel[] = [];
  @observable public raimReceiverTypes: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.aircraft);
  }

  /* istanbul ignore next */
  public getAcarsManufacturers(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.acarsManufacturer,
      this.acarsManufacturers,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(acarsManufacturers => (this.acarsManufacturers = acarsManufacturers)));
  }

  /* istanbul ignore next */
  public upsertAcarsManufacturer(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.acarsManufacturer, 'ACARS Manufacturer').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((acarsManufacturer: SettingsTypeModel) => {
        this.acarsManufacturers = Utilities.updateArray<SettingsTypeModel>(this.acarsManufacturers, acarsManufacturer, {
          replace: !isNewRequest,
          predicate: t => t.id === acarsManufacturer.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAcarsModels(forceRefresh?: boolean): Observable<AcarsModel[]> {
    return this.getResult(apiUrls.acarsModel, this.acarsModels, forceRefresh, AcarsModel.deserializeList).pipe(
      tapWithAction(acarsModels => (this.acarsModels = acarsModels))
    );
  }

  /* istanbul ignore next */
  public upsertAcarsModel(request: AcarsModel): Observable<AcarsModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIAcarsModel>(request.serialize(), apiUrls.acarsModel, 'ACARS Model').pipe(
      map((response: IAPIAcarsModel) => AcarsModel.deserialize(response)),
      tapWithAction((acarsModel: AcarsModel) => {
        this.acarsModels = Utilities.updateArray<AcarsModel>(this.acarsModels, acarsModel, {
          replace: !isAddRequest,
          predicate: t => t.id === acarsModel.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFmsManufacturers(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.fmsManufacturer,
      this.fmsManufacturers,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(fmsManufacturers => (this.fmsManufacturers = fmsManufacturers)));
  }

  /* istanbul ignore next */
  public upsertFmsManufacturer(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.fmsManufacturer, 'FMS Manufacturer').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((fmsManufacturer: SettingsTypeModel) => {
        this.fmsManufacturers = Utilities.updateArray<SettingsTypeModel>(this.fmsManufacturers, fmsManufacturer, {
          replace: !isNewRequest,
          predicate: t => t.id === fmsManufacturer.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAcarsSoftwareVersions(forceRefresh?: boolean): Observable<AcarsSoftwareVersionModel[]> {
    return this.getResult(
      apiUrls.acarsSoftwareVersion,
      this.acarsSoftwareVersions,
      forceRefresh,
      AcarsSoftwareVersionModel.deserializeList
    ).pipe(tapWithAction(acarsSoftwareVersions => (this.acarsSoftwareVersions = acarsSoftwareVersions)));
  }

  /* istanbul ignore next */
  public upsertAscarSoftwareVersion(request: AcarsSoftwareVersionModel): Observable<AcarsSoftwareVersionModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIAcarsSoftwareVersion>(
      request.serialize(),
      apiUrls.acarsSoftwareVersion,
      'ACARS Software Version'
    ).pipe(
      map((response: IAPIAcarsSoftwareVersion) => AcarsSoftwareVersionModel.deserialize(response)),
      tapWithAction((acarsSoftwareVersion: AcarsSoftwareVersionModel) => {
        this.acarsSoftwareVersions = Utilities.updateArray<AcarsSoftwareVersionModel>(
          this.acarsSoftwareVersions,
          acarsSoftwareVersion,
          {
            replace: !isAddRequest,
            predicate: t => t.id === acarsSoftwareVersion.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getAesManufacturers(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.aesManufacturer,
      this.aesManufacturers,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(aesManufacturers => (this.aesManufacturers = aesManufacturers)));
  }

  /* istanbul ignore next */
  public upsertAesManufacturer(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.aesManufacturer, 'AES Manufacturer').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((aesManufacturer: SettingsTypeModel) => {
        this.aesManufacturers = Utilities.updateArray<SettingsTypeModel>(this.aesManufacturers, aesManufacturer, {
          replace: !isNewRequest,
          predicate: t => t.id === aesManufacturer.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFmsModels(forceRefresh?: boolean): Observable<FmsModel[]> {
    return this.getResult(apiUrls.fmsModel, this.fmsModels, forceRefresh, FmsModel.deserializeList).pipe(
      tapWithAction(fmsModels => (this.fmsModels = fmsModels))
    );
  }

  /* istanbul ignore next */
  public upsertFmsModel(request: FmsModel): Observable<FmsModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIFmsModel>(request.serialize(), apiUrls.fmsModel, 'FMS Model').pipe(
      map((response: IAPIFmsModel) => FmsModel.deserialize(response)),
      tapWithAction((fmsModel: FmsModel) => {
        this.fmsModels = Utilities.updateArray<FmsModel>(this.fmsModels, fmsModel, {
          replace: !isAddRequest,
          predicate: t => t.id === fmsModel.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAcarsMessageSets(forceRefresh?: boolean): Observable<AcarsMessageSetModel[]> {
    return this.getResult(
      apiUrls.acarsMessageSet,
      this.acarsMessageSets,
      forceRefresh,
      AcarsMessageSetModel.deserializeList
    ).pipe(tapWithAction(acarsMessageSets => (this.acarsMessageSets = acarsMessageSets)));
  }

  /* istanbul ignore next */
  public upsertAscarMessageSet(request: AcarsMessageSetModel): Observable<AcarsMessageSetModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIAcarsMessageSet>(request.serialize(), apiUrls.acarsMessageSet, 'ACARS Message Set').pipe(
      map((response: IAPIAcarsMessageSet) => AcarsMessageSetModel.deserialize(response)),
      tapWithAction((acarsMessageSet: AcarsMessageSetModel) => {
        this.acarsMessageSets = Utilities.updateArray<AcarsMessageSetModel>(this.acarsMessageSets, acarsMessageSet, {
          replace: !isAddRequest,
          predicate: t => t.id === acarsMessageSet.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAesModels(forceRefresh?: boolean): Observable<AesModel[]> {
    return this.getResult(apiUrls.aesModel, this.aesModels, forceRefresh, AesModel.deserializeList).pipe(
      tapWithAction(aesModels => (this.aesModels = aesModels))
    );
  }

  /* istanbul ignore next */
  public upsertAesModel(request: AesModel): Observable<AesModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIAesModel>(request.serialize(), apiUrls.aesModel, 'AES Model').pipe(
      map((response: IAPIAesModel) => AesModel.deserialize(response)),
      tapWithAction((aesModel: AesModel) => {
        this.aesModels = Utilities.updateArray<AesModel>(this.aesModels, aesModel, {
          replace: !isAddRequest,
          predicate: t => t.id === aesModel.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getRaimReportTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.raimReportType,
      this.raimReportTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(raimReportTypes => (this.raimReportTypes = raimReportTypes)));
  }

  /* istanbul ignore next */
  public upsertRaimReportType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.raimReportType, 'RAIM Report Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((raimReportType: SettingsTypeModel) => {
        this.raimReportTypes = Utilities.updateArray<SettingsTypeModel>(this.raimReportTypes, raimReportType, {
          replace: !isNewRequest,
          predicate: t => t.id === raimReportType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFmsSoftwareVersions(forceRefresh?: boolean): Observable<FmsSoftwareVersionModel[]> {
    return this.getResult(
      apiUrls.fmsSoftwareVersion,
      this.fmsSoftwareVersions,
      forceRefresh,
      FmsSoftwareVersionModel.deserializeList
    ).pipe(tapWithAction(fmsSoftwareVersions => (this.fmsSoftwareVersions = fmsSoftwareVersions)));
  }

  /* istanbul ignore next */
  public upsertFmsSoftwareVersion(request: FmsSoftwareVersionModel): Observable<FmsSoftwareVersionModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPIFmsSoftwareVersion>(
      request.serialize(),
      apiUrls.fmsSoftwareVersion,
      'FMS Software Version'
    ).pipe(
      map((response: IAPIFmsSoftwareVersion) => FmsSoftwareVersionModel.deserialize(response)),
      tapWithAction((fmsSoftwareVersion: FmsSoftwareVersionModel) => {
        this.fmsSoftwareVersions = Utilities.updateArray<FmsSoftwareVersionModel>(
          this.fmsSoftwareVersions,
          fmsSoftwareVersion,
          {
            replace: !isAddRequest,
            predicate: t => t.id === fmsSoftwareVersion.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getNfpFuelReserveTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.nfpFuelReserveType,
      this.nfpFuelReserveTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(nfpFuelReserveTypes => (this.nfpFuelReserveTypes = nfpFuelReserveTypes)));
  }

  /* istanbul ignore next */
  public upsertNfpFuelReserveType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.nfpFuelReserveType, 'NFP Fuel Reserve Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((nfpFuelReserveType: SettingsTypeModel) => {
        this.nfpFuelReserveTypes = Utilities.updateArray<SettingsTypeModel>(
          this.nfpFuelReserveTypes,
          nfpFuelReserveType,
          {
            replace: !isNewRequest,
            predicate: t => t.id === nfpFuelReserveType.id,
          }
        );
      })
    );
  }
  
  /* istanbul ignore next */
  public getRaimReceiverTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.raimReceiverType,
      this.raimReceiverTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(raimReceiverTypes => (this.raimReceiverTypes = raimReceiverTypes)));
  }

  /* istanbul ignore next */
  public upsertRaimReceiverType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.raimReceiverType, 'RAIM Receiver Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((raimReceiverType: SettingsTypeModel) => {
        this.raimReceiverTypes = Utilities.updateArray<SettingsTypeModel>(this.raimReceiverTypes, raimReceiverType, {
          replace: !isNewRequest,
          predicate: t => t.id === raimReceiverType.id,
        });
      })
    );
  }
}
