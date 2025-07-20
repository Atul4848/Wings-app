import { ISelectOption } from "./SelectOption.interface";

export interface IFilters {
    searchValue: string;
    chipValue: Array<string | ISelectOption>;
    selectInputsValues: Map<string, string>;
  }
  