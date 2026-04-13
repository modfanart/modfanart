import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dto/create-contest.dto';

@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Get()
  getContests(@Query() query: any) {
    return this.contestsService.getContests(query);
  }

  @Get('by-status')
  getContestsByStatus(@Query() query: any) {
    return this.contestsService.getContestsByStatus(query);
  }

  @Get(':id')
  getContest(@Param('id') id: string) {
    return this.contestsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createContest(@Req() req, @Body() dto: CreateContestDto) {
    return this.contestsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateContest(@Param('id') id: string, @Body() dto: any) {
    // ...
  }

  @Post(':contestId/entries')
  @UseGuards(JwtAuthGuard)
  submitEntry(
    @Req() req,
    @Param('contestId') contestId: string,
    @Body() body: any,
  ) {
    // ...
  }

  @Post(':contestId/judges')
  @UseGuards(JwtAuthGuard)
  assignJudge(
    @Req() req,
    @Param('contestId') contestId: string,
    @Body() body: any,
  ) {
    // ...
  }

  @Post(':contestId/entries/:entryId/score')
  @UseGuards(JwtAuthGuard)
  submitScore(
    @Req() req,
    @Param('contestId') contestId: string,
    @Param('entryId') entryId: string,
    @Body() dto: any,
  ) {
    // ...
  }

  @Post(':contestId/entries/:entryId/vote')
  @UseGuards(JwtAuthGuard)
  vote(
    @Req() req,
    @Param('contestId') contestId: string,
    @Param('entryId') entryId: string,
  ) {
    // ...
  }

  // More endpoints as needed
}
