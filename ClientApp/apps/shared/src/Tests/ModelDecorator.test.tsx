import { expect } from "chai";
import { modelProtection } from '../Decorators';

@modelProtection
class TestingModel {
  id: number = 0;
  name: string = 'Default';
  array: number[] = [];
  obj: { name: string } = null;
  private _data: string;

  constructor(data?: Partial<TestingModel>, otherData?: string) {
    Object.assign(this, data);
    this._data = otherData || 'Default Data';
  }

  public get data(): string {
    return this._data;
  }
}

describe('Model Decorator test modelProtection', () => {
  it('Default Values Set Correctly', () => {
    const model = new TestingModel({ obj: { name: 'Nick' } });

    expect(model.id).equal(0);
    expect(model.name).equal('Default');
    expect(model.array.length).equal(0);
    expect(model.obj.name).equal('Nick');
    expect(model.data).equal('Default Data');
  });

  it('Prevent Undefined on new Instance Creation', () => {
    const model = new TestingModel();
    model.id = undefined;
    model.name = undefined;
    model.array = undefined;
    model.obj = undefined;

    const newInstance = new TestingModel(model, 'Other Flag');

    expect(newInstance.id).equal(0);
    expect(newInstance.name).equal('Default');
    expect(newInstance.array.length).equal(0);
    expect(newInstance.obj).equal(null);
    expect(newInstance.data).equal('Other Flag');
  });
});
