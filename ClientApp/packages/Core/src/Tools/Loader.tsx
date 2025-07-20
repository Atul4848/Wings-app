import React, { ReactNode } from 'react';
import { action, observable, runInAction } from 'mobx';

import { Progress, ILoaderOptions, PROGRESS_TYPES } from '@uvgo-shared/progress';

class Loader {
  readonly defaultLoaderOptions = { type: PROGRESS_TYPES.CIRCLE };
  private loaderOptions: ILoaderOptions;
  @observable public isLoading: boolean;

  /* istanbul ignore next */
  constructor(initialState: boolean = false, loaderOptions?: ILoaderOptions) {
    this.loaderOptions = loaderOptions || this.defaultLoaderOptions;
    runInAction(() => (this.isLoading = initialState));
  }

  @action
  public showLoader(): void {
    this.isLoading = true;
  }

  @action
  public hideLoader(): void {
    this.isLoading = false;
  }

  public setLoadingState(loadingState: boolean): void {
    loadingState ? this.showLoader() : this.hideLoader();
  }

  public get spinner(): ReactNode {
    return this.isLoading ? <Progress {...this.loaderOptions} /> : null;
  }
}

export default Loader;
