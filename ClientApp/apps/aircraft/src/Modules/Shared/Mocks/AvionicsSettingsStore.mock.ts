import { AvionicsSettingsStore } from '../Stores';
import { Observable, of } from 'rxjs';
import {
  AcarsMessageSetModel,
  AesModel,
  FmsModel,
  AcarsModel,
  AcarsSoftwareVersionModel,
  FmsSoftwareVersionModel,
} from '../Models';
import { tapWithAction, SettingsTypeModel } from '@wings-shared/core';

export class AvionicsSettingsStoreMock extends AvionicsSettingsStore {
  public getAcarsManufacturers(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction(acarsManufacturers => (this.acarsManufacturers = acarsManufacturers))
    );
  }

  public upsertAcarsManufacturer(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getAcarsModels(forceRefresh?: boolean): Observable<AcarsModel[]> {
    return of([ new AcarsModel(), new AcarsModel() ]).pipe(
      tapWithAction((acarsModels: AcarsModel[]) => (this.acarsModels = acarsModels))
    );
  }

  public upsertAcarsModel(request: AcarsModel): Observable<AcarsModel> {
    return of(new AcarsModel());
  }

  public getFmsManufacturers(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction(fmsManufacturers => (this.fmsManufacturers = fmsManufacturers))
    );
  }

  public upsertFmsManufacturer(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getAcarsSoftwareVersions(forceRefresh?: boolean): Observable<AcarsSoftwareVersionModel[]> {
    return of([ new AcarsSoftwareVersionModel() ]).pipe(
      tapWithAction(
        (acarsSoftwareVersions: AcarsSoftwareVersionModel[]) => (this.acarsSoftwareVersions = acarsSoftwareVersions)
      )
    );
  }

  public upsertAscarSoftwareVersion(request: AcarsSoftwareVersionModel): Observable<AcarsSoftwareVersionModel> {
    return of(new AcarsSoftwareVersionModel());
  }

  public getAesManufacturers(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction(aesManufacturers => (this.aesManufacturers = aesManufacturers))
    );
  }

  public upsertAesManufacturer(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getFmsModels(forceRefresh?: boolean): Observable<FmsModel[]> {
    return of([ new FmsModel(), new FmsModel() ]).pipe(
      tapWithAction((fmsModels: FmsModel[]) => (this.fmsModels = fmsModels))
    );
  }

  public upsertFmsModel(request: FmsModel): Observable<FmsModel> {
    return of(new FmsModel());
  }

  public getAcarsMessageSets(forceRefresh?: boolean): Observable<AcarsMessageSetModel[]> {
    return of([ new AcarsMessageSetModel() ]).pipe(
      tapWithAction((acarsMessageSets: AcarsMessageSetModel[]) => (this.acarsMessageSets = acarsMessageSets))
    );
  }

  public upsertAscarMessageSet(request: AcarsMessageSetModel): Observable<AcarsMessageSetModel> {
    return of(new AcarsMessageSetModel());
  }

  public getAesModels(forceRefresh?: boolean): Observable<AesModel[]> {
    return of([ new AesModel() ]).pipe(tapWithAction((aesModels: AesModel[]) => (this.aesModels = aesModels)));
  }

  public upsertAesModel(request: AesModel): Observable<AesModel> {
    return of(new AesModel());
  }

  public getRaimReportTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction(raimReportTypes => (this.raimReportTypes = raimReportTypes))
    );
  }

  public upsertRaimReportType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getFmsSoftwareVersions(forceRefresh?: boolean): Observable<FmsSoftwareVersionModel[]> {
    return of([ new FmsSoftwareVersionModel(), new FmsSoftwareVersionModel() ]).pipe(
      tapWithAction(
        (fmsSoftwareVersions: FmsSoftwareVersionModel[]) => (this.fmsSoftwareVersions = fmsSoftwareVersions)
      )
    );
  }

  public upsertFmsSoftwareVersion(request: FmsSoftwareVersionModel): Observable<FmsSoftwareVersionModel> {
    return of(new FmsSoftwareVersionModel());
  }

  public getNfpFuelReserveTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction(nfpFuelReserveTypes => (this.nfpFuelReserveTypes = nfpFuelReserveTypes))
    );
  }

  public upsertNfpFuelReserveType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getRaimReceiverTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction(raimReceiverTypes => (this.raimReceiverTypes = raimReceiverTypes))
    );
  }

  public upsertRaimReceiverType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }
}
