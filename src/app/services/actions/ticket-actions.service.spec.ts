import { TestBed } from '@angular/core/testing';

import { TicketActionsService } from './ticket-actions.service';

describe('TicketActionsService', () => {
  let service: TicketActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
