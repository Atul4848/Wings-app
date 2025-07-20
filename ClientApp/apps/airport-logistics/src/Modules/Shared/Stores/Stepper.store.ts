import { action, observable } from 'mobx';

class StepperStore {
  public readonly maxSteps: number = 5;
  @observable public isLoading: boolean = true;
  @observable public activeStep: number = 1;

  @action
  public handleBack(): void {
    this.activeStep = this.activeStep - 1;
  }

  @action
  public handleNext(): void {
    this.activeStep = this.activeStep + 1;
  }
}

const stepperStore = new StepperStore();
export default stepperStore;
