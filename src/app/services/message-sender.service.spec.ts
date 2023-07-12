import { TestBed } from '@angular/core/testing';

import { MessageSenderService } from './message-sender.service';

describe('MessageSenderService', () => {
  let service: MessageSenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageSenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
