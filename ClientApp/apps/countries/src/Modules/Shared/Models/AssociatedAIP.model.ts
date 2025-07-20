import { CountryModel } from '@wings/shared';
import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAssociatedAIP, IAPIAssociatedAipRequest } from '../Interfaces';
import { AeronauticalInformationPublicationModel } from './AeronauticalInformationPublication.model';

@modelProtection
export class AssociatedAIPModel extends CoreModel {
  country: CountryModel;
  aeronauticalInformationPublication: AeronauticalInformationPublicationModel;

  constructor(data?: Partial<AssociatedAIPModel>) {
    super(data);
    Object.assign(this, data);
    this.country = new CountryModel(data?.country);
    this.aeronauticalInformationPublication = new AeronauticalInformationPublicationModel(
      data?.aeronauticalInformationPublication
    );
  }

  static deserialize(apiData: IAPIAssociatedAIP): AssociatedAIPModel {
    if (!apiData) {
      return new AssociatedAIPModel();
    }
    const data: Partial<AssociatedAIPModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      aeronauticalInformationPublication: AeronauticalInformationPublicationModel.deserialize(
        apiData.aeronauticalInformationPublication
      ),
      country: CountryModel.deserialize(apiData.country),
      id: apiData.id,
    };
    return new AssociatedAIPModel(data);
  }

  static deserializeList(apiDataList: IAPIAssociatedAIP[]): AssociatedAIPModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIAssociatedAIP) => AssociatedAIPModel.deserialize(apiData)) : [];
  }

  public serialize(): IAPIAssociatedAipRequest {
    return {
      ...this._serialize(),
      id: this.id,
      aeronauticalInformationPublicationId: this.aeronauticalInformationPublication.link.id,
      countryId: this.country.id,
    };
  }
}
