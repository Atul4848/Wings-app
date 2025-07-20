import { IAPIAircraftVariationPicture } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class AircraftVariationPictureModel extends CoreModel implements ISelectOption {
  picture?: string;
  url?: string;

  constructor(data?: Partial<AircraftVariationPictureModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAircraftVariationPicture): AircraftVariationPictureModel {
    if (!apiData) {
      return new AircraftVariationPictureModel();
    }
    const data: Partial<AircraftVariationPictureModel> = {
      ...apiData,
    };
    return new AircraftVariationPictureModel(data);
  }

  public serialize(): IAPIAircraftVariationPicture {
    return {
      id: 0,
      picture: this.picture,
      url: this.url,
    };
  }

  // required in auto complete
  public get label(): string {
    return this.url;
  }

  public get value(): string | number {
    return this.id;
  }
}
