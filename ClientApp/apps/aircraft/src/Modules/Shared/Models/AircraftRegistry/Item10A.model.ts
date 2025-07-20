import { IAPIItem10A } from '../../Interfaces';
import { CoreModel, modelProtection, ISelectOption } from '@wings-shared/core';
@modelProtection
export class Item10AModel extends CoreModel implements ISelectOption {
  isLORANC: boolean;
  isDME: boolean;
  isFMCWPRACARS: boolean;
  isFISACARS: boolean;
  isPDCACARS: boolean;
  isADF: boolean;
  isGNSS: boolean;
  isHFnumber: boolean;
  isInertialNavigation: boolean;
  isMLS: boolean;
  isILS: boolean;
  isSATVOICEINMARSAT: boolean;
  isSATVOICEMTSAT: boolean;
  isSATVOICEIRIDIUM: boolean;
  isVOR: boolean;
  isTACAN: boolean;
  isUHFRTF: boolean;
  isVHFRTF: boolean;
  is833KHz: boolean;
  isOther: boolean;

  constructor(data?: Partial<Item10AModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIItem10A): Item10AModel {
    if (!apiData) {
      return new Item10AModel();
    }
    const data: Partial<Item10AModel> = {
      ...apiData,
    };
    return new Item10AModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
