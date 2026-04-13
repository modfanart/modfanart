import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';
import { Contest } from './entities/contest.entity';
import { ContestEntry } from './entities/contest-entry.entity';
import { ContestJudge } from './entities/contest-judge.entity';
import { ContestJudgeScore } from './entities/contest-judge-score.entity';
import { ContestVote } from './entities/contest-vote.entity';
import { ContestCategory } from './entities/contest-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contest,
      ContestEntry,
      ContestJudge,
      ContestJudgeScore,
      ContestVote,
      ContestCategory,
    ]),
  ],
  controllers: [ContestsController],
  providers: [ContestsService],
  exports: [ContestsService],
})
export class ContestsModule {}
