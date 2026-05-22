import { Test, TestingModule } from '@nestjs/testing';
import { BeatService } from './beat.service';

describe('BeatService', () => {
  let service: BeatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeatService],
    }).compile();

    service = module.get<BeatService>(BeatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
