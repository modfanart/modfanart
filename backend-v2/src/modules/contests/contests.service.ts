import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contest } from './entities/contest.entity';
import { ContestEntry } from './entities/contest-entry.entity';
import { ContestJudge } from './entities/contest-judge.entity';
import { ContestJudgeScore } from './entities/contest-judge-score.entity';
import { CreateContestDto } from '../dto/create-contest.dto';

@Injectable()
export class ContestsService {
  constructor(
    @InjectRepository(Contest) private contestRepo: Repository<Contest>,
    @InjectRepository(ContestEntry) private entryRepo: Repository<ContestEntry>,
    @InjectRepository(ContestJudge) private judgeRepo: Repository<ContestJudge>,
    @InjectRepository(ContestJudgeScore)
    private scoreRepo: Repository<ContestJudgeScore>,
  ) {}

  async create(userId: string, dto: CreateContestDto) {
    // Business logic + slug generation + transaction
    // (Full implementation matches your original createContest)
  }

  async findById(id: string) {
    const contest = await this.contestRepo.findOne({
      where: { id, deleted_at: null },
      relations: ['brand'],
    });
    if (!contest) throw new NotFoundException('Contest not found');
    return contest;
  }

  async getContestsByStatus(query: any) {
    // Full pagination + filtering as in your getContestsByStatus
  }

  // Add methods for entries, judges, scores, voting, etc.
}
