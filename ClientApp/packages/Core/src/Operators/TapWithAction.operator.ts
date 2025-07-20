import { runInAction } from 'mobx';
import { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';

export function tapWithAction<T>(action: Function): MonoTypeOperatorFunction<T> {
  return tap(response => runInAction(() => action(response)));
}
