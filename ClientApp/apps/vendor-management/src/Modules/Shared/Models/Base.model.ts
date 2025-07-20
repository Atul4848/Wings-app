import { ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class BaseModel implements ISelectOption  {
  id:number;
  name:string;
  description?: string = '';
  
  constructor(data?: Partial<BaseModel>){
    Object.assign(this,data);
  }
  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}