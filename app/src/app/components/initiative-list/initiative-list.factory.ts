import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { InitiativeListService } from './initiative-list.service';
import { AppServiceStore } from 'src/app/app.service.store';

export function initiativeListServiceInit(
  signalR: SignalRService,
  appStore: AppServiceStore
) {
  return () => {
    new InitiativeListService(signalR, appStore);
  };
}
