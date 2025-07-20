import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChannelModel } from '../Models';
import { ChannelStore } from '../Stores';

export class ChannelStoreMock extends ChannelStore {
  public getChannels(): Observable<ChannelModel[]> {
    return of([ new ChannelModel(), new ChannelModel() ]).pipe(tap(channels => (this.channels = channels)));
  }

  public removeChannel({ id }: ChannelModel): Observable<boolean> {
    return of(true);
  }

  public upsertChannel(channel: ChannelModel): Observable<ChannelModel> {
    return of(new ChannelModel());
  }
}
