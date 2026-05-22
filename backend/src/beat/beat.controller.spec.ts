import { Test, TestingModule } from '@nestjs/testing';
import { BeatController } from './beat.controller';

describe('BeatController', () => {
  let controller: BeatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeatController],
    }).compile();

    controller = module.get<BeatController>(BeatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
