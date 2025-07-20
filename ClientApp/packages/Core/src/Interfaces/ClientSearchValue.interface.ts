import { ISelectOption } from "./SelectOption.interface";

export interface IClientSearchValue {
  searchValue: string;
  selectedOption: string;
  otherSelectedOption?: string;
  chipValue?: Array<ISelectOption>;
}
