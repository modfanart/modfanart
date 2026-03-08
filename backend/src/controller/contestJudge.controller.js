// src/controllers/contestJudge.controller.js
const Contest = require('../models/contest.model');
const ContestJudge = require('../models/contestJudge.model');
const User = require('../models/user.model');
const { db } = require('../config');
class ContestJudgeController {
  static async inviteJudge(req, res) {
    try {
      const { contestId } = req.params;
      const { judgeId } = req.body;

      const contest = await Contest.findById(contestId);
      if (!contest || contest.brand_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to invite judges' });
      }

      const judge = await User.findById(judgeId);
      if (!judge) return res.status(404).json({ error: 'Judge user not found' });
      if (!judge.permissions?.['contests.judge']) {
        return res.status(400).json({ error: 'User does not have judge permissions' });
      }

      const assignment = await ContestJudge.assign(contestId, judgeId, req.user.id);
      if (!assignment) {
        return res.status(409).json({ error: 'Judge already invited' });
      }

      // TODO: send notification/email to judge

      res.status(201).json({
        message: 'Judge invited successfully',
        judge: { id: judgeId, username: judge.username },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to invite judge' });
    }
  }

  static async acceptInvitation(req, res) {
    try {
      const { contestId, judgeId } = req.params;

      if (judgeId !== req.user.id) {
        return res.status(403).json({ error: 'This invitation is not for you' });
      }

      const assignment = await ContestJudge.acceptInvitation(contestId, judgeId);
      if (!assignment) {
        return res.status(404).json({ error: 'Invitation not found or already processed' });
      }

      res.json({ message: 'You have accepted the judge invitation' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to accept invitation' });
    }
  }

  static async getJudges(req, res) {
    try {
      const { contestId } = req.params;

      const judges = await ContestJudge.getJudgesForContest(contestId);

      res.json({ judges });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch judges' });
    }
  }

  static async removeJudge(req, res) {
    try {
      const { contestId, judgeId } = req.params;

      const contest = await Contest.findById(contestId);
      if (!contest || contest.brand_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to remove judges' });
      }

      await ContestJudge.removeJudge(contestId, judgeId);

      res.json({ message: 'Judge removed from contest', judgeId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to remove judge' });
    }
  }
static async getAllContestsByJudgeId(req, res) {
  try {
    const judgeId = req.user.id;

    const contests = await db
      .selectFrom('contest_judges as cj')
      .innerJoin('contests as c', 'c.id', 'cj.contest_id')
      .select([
        'c.id',
        'c.title',
        'c.slug',
        'c.description',
        'c.status',
        'c.start_date',
        'c.submission_end_date',
        'c.judging_end_date',
        'c.created_at',
      ])
      .where('cj.judge_id', '=', judgeId)
      .where('cj.accepted', '=', true)
      .orderBy('c.created_at', 'desc')
      .execute();

    res.json({
      contests,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch judge contests' });
  }
}
}

module.exports = ContestJudgeController;