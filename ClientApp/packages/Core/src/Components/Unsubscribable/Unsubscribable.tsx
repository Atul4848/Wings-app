import { action, observable } from 'mobx';
import { Component } from 'react';
import { Subject } from 'rxjs';

class Unsubscribable<Props, State = {}> extends Component<Props, State> {
  @observable protected hasLoaded: boolean = false;
  protected readonly debounceTime: number = 300;
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  protected debounce$: Subject<string> = new Subject<string>();
  protected gridAdvancedSearchFilterDebounce$: Subject<string> = new Subject<string>();

  // validate fields
  @observable isAlreadyExistMap: Map<string, boolean> = new Map<string, boolean>();

  constructor(props: Props) {
    super(props);
  }

  componentWillUnmount() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  // Needs to use for cases where we have some data dependency 
  @action
  protected setHasLoaded(hasLoaded: boolean): void {
    this.hasLoaded = hasLoaded;
  }

  // need for testing
  render() {
    return null;
  }
}

export default Unsubscribable;
