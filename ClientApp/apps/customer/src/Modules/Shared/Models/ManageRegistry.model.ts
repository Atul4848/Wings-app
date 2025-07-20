import { IAPIManageRegistriesRequest } from '../Interfaces';
import { AssociatedOfficeModel } from './AssociatedOffice.model';
import { RegistryModel } from './Registry.model';
import { TeamModel } from './Team.model';

export class ManageRegistriesModel {
  partyId: number;
  customerNumber: string;
  registries: RegistryModel[];
  team: TeamModel;
  office: AssociatedOfficeModel;
  includeAllRegistry: boolean;

  constructor(data?: Partial<ManageRegistriesModel>) {
    Object.assign(this, data);
  }

  // serialize object for create/update API
  public serialize(): IAPIManageRegistriesRequest {
    return {
      partyId: this.partyId,
      customerNumber: this.customerNumber,
      teamId: this.team?.id,
      includeAllRegistry: this.includeAllRegistry || false,
      customerAssociatedRegistryIds: this.registries.map(x => x.id),
      associatedOfficeId: this.office ? this.office.id : null,
    };
  }
}
