import { CityModel, CountryModel, RegionModel, StateModel } from '@wings/shared';
import { ICellEditorComp } from 'ag-grid-community';

interface GeoFilterSetup {
  countryInstance: ICellEditorComp;
  stateInstance: ICellEditorComp;
  cityInstance: ICellEditorComp;
  regionInstance: ICellEditorComp;
}

export class GeoFilter {
  private _countryInstance: ICellEditorComp;
  private _stateInstance: ICellEditorComp;
  private _cityInstance: ICellEditorComp;
  private _regionInstance: ICellEditorComp;

  constructor(data?: GeoFilterSetup) {
    this._countryInstance = data?.countryInstance;
    this._stateInstance = data?.stateInstance;
    this._cityInstance = data?.cityInstance;
    this._regionInstance = data?.regionInstance;
  }

  public get selectedCountries(): CountryModel[] {
    return this.getInstanceValue<CountryModel>(this._countryInstance);
  }

  public get selectedStates(): StateModel[] {
    return this.getInstanceValue<StateModel>(this._stateInstance);
  }

  public get selectedCities(): CityModel[] {
    return this.getInstanceValue<CityModel>(this._cityInstance);
  }

  public get selectedRegions(): RegionModel[] {
    return this.getInstanceValue<RegionModel>(this._regionInstance);
  }

  /* istanbul ignore next */
  public get filteredStates(): StateModel[] {
    return this.selectedStates.filter(({ country }: StateModel) =>
      this.selectedCountries.some(({ id }: CountryModel) => id === country?.id)
    );
  }

  /* istanbul ignore next */
  public get filteredCitiesByCountries(): CityModel[] {
    return this.selectedCities.filter(({ country }: CityModel) =>
      this.selectedCountries.some(({ id }: CountryModel) => id === country?.id)
    );
  }

  /* istanbul ignore next */
  public get filteredRegions(): RegionModel[] {
    let filteredRegions: RegionModel[] = [];

    //filtered regions w.r.t selected countries
    this.selectedCountries?.forEach((country: CountryModel) => {
      const existingRegions = country.associatedRegions?.filter((countryRegion: RegionModel) =>
        this.selectedRegions.some((region: RegionModel) => region.id === countryRegion.regionId)
      );

      if (Array.isArray(existingRegions) && existingRegions.length) {
        filteredRegions = filteredRegions.concat(existingRegions);
      }
    });

    return filteredRegions;
  }

  /* istanbul ignore next */
  public get filteredCitiesByStates(): CityModel[] {
    return this.selectedCities.filter(({ state, country }: CityModel) =>
      this.selectedStates.some((_state: StateModel) => _state.id === state?.id && _state.country?.id === country.id)
    );
  }

  /* istanbul ignore next */
  private getInstanceValue<T>(instance: ICellEditorComp): T[] {
    if(!instance) {
      return [];
    }

    const value = instance.getValue();
    return Array.isArray(value) ? value : [];
  }
}
