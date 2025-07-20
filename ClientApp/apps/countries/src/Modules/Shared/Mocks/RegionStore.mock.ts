import { Observable, of } from 'rxjs';
import { RegionModel } from '@wings/shared';
import { AssociatedRegionModel } from '../Models';
import { IAPIAssociatedRegionRequest } from '../Interfaces';
import { RegionStore } from '../Stores';

export class RegionStoreMock extends RegionStore {
  public getRegions(regionTypeId?: number): Observable<RegionModel[]> {
    return of([ new RegionModel(), new RegionModel() ]);
  }

  public upsertRegion(region: RegionModel): Observable<RegionModel> {
    return of(new RegionModel());
  }

  public getAssociatedRegions(): Observable<AssociatedRegionModel[]> {
    return of([ new AssociatedRegionModel(), new AssociatedRegionModel() ]);
  }

  public upsertAssociatedRegion(associatedRegion: AssociatedRegionModel): Observable<AssociatedRegionModel> {
    return of(new AssociatedRegionModel());
  }
}
