import User, { IUser } from '@/lib/models/User';
import Match from '@/lib/models/Match';

const SKILL_CATEGORIES = {
  technical: ['python', 'javascript', 'react', 'typescript', 'node', 'aws', 'machine learning', 'ai', 'ml', 'data science', 'engineering', 'software', 'backend', 'frontend', 'fullstack', 'ios', 'android', 'mobile', 'devops', 'blockchain', 'web3', 'rust', 'go', 'java', 'c++'],
  business: ['sales', 'marketing', 'finance', 'strategy', 'operations', 'growth', 'fundraising', 'product management', 'business development', 'consulting', 'accounting', 'legal', 'hr', 'partnerships'],
  design: ['ui', 'ux', 'product design', 'graphic design', 'figma', 'branding', 'user research'],
};

function categorizeSkills(skills: string[]): Record<string, number> {
  const counts: Record<string, number> = { technical: 0, business: 0, design: 0 };
  for (const skill of skills) {
    const lower = skill.toLowerCase();
    for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
      if (keywords.some((k) => lower.includes(k))) {
        counts[category]++;
      }
    }
  }
  return counts;
}

function computeSkillComplementarity(u1Skills: string[], u2Skills: string[]): number {
  const cat1 = categorizeSkills(u1Skills);
  const cat2 = categorizeSkills(u2Skills);

  const categories = Object.keys(SKILL_CATEGORIES);
  let complementaryScore = 0;

  for (const cat of categories) {
    if ((cat1[cat] > 0 && cat2[cat] === 0) || (cat1[cat] === 0 && cat2[cat] > 0)) {
      complementaryScore += 30;
    } else if (cat1[cat] > 0 && cat2[cat] > 0) {
      complementaryScore += 10;
    }
  }

  const s1 = new Set(u1Skills.map((s) => s.toLowerCase()));
  const s2 = new Set(u2Skills.map((s) => s.toLowerCase()));
  const overlap = [...s1].filter((s) => s2.has(s)).length;
  const total = new Set([...s1, ...s2]).size;
  const overlapRatio = total > 0 ? overlap / total : 0;

  const diversityBonus = (1 - overlapRatio) * 20;

  return Math.min(100, complementaryScore + diversityBonus);
}

function computeInterestAlignment(u1: string[], u2: string[]): number {
  if (u1.length === 0 || u2.length === 0) return 50;

  const s1 = new Set(u1.map((s) => s.toLowerCase()));
  const s2 = new Set(u2.map((s) => s.toLowerCase()));
  const overlap = [...s1].filter((s) => s2.has(s)).length;
  const maxPossible = Math.min(s1.size, s2.size);

  return maxPossible > 0 ? Math.round((overlap / maxPossible) * 100) : 50;
}

function computeSchoolDiversity(school1: string, school2: string): number {
  return school1 !== school2 ? 100 : 40;
}

function computeStageAlignment(u1: IUser, u2: IUser): number {
  const y1 = u1.profile?.yearOfStudy?.toLowerCase() || '';
  const y2 = u2.profile?.yearOfStudy?.toLowerCase() || '';

  if (y1 === y2 && y1) return 100;
  if (!y1 || !y2) return 60;

  const stages = ['1st', '2nd', '3rd', '4th', 'phd', 'mba', 'masters', 'alumni'];
  const i1 = stages.findIndex((s) => y1.includes(s));
  const i2 = stages.findIndex((s) => y2.includes(s));

  if (i1 === -1 || i2 === -1) return 60;
  const diff = Math.abs(i1 - i2);
  return Math.max(0, 100 - diff * 20);
}

export async function computeMatchScore(u1: IUser, u2: IUser): Promise<{
  score: number;
  breakdown: { skillComplementarity: number; interestAlignment: number; schoolDiversity: number; stageAlignment: number };
}> {
  const skillComplementarity = computeSkillComplementarity(
    u1.profile?.skills || [],
    u2.profile?.skills || []
  );
  const interestAlignment = computeInterestAlignment(
    u1.profile?.interests || [],
    u2.profile?.interests || []
  );
  const schoolDiversity = computeSchoolDiversity(u1.school, u2.school);
  const stageAlignment = computeStageAlignment(u1, u2);

  const bothSparse =
    (u1.profile?.skills || []).length === 0 &&
    (u2.profile?.skills || []).length === 0 &&
    (u1.profile?.interests || []).length === 0 &&
    (u2.profile?.interests || []).length === 0;

  const randomness = bothSparse ? Math.random() * 40 : 0;

  const score = Math.round(
    skillComplementarity * 0.35 +
    interestAlignment * 0.25 +
    schoolDiversity * 0.15 +
    stageAlignment * 0.15 +
    10 +
    randomness
  );

  return {
    score: Math.min(99, Math.max(1, score)),
    breakdown: { skillComplementarity, interestAlignment, schoolDiversity, stageAlignment },
  };
}

export async function generateWeeklyMatches() {
  const users = await User.find({ isApproved: true }).lean() as unknown as IUser[];

  if (users.length < 2) return { matched: 0 };

  const now = new Date();
  const weekOf = new Date(now);
  weekOf.setDate(weekOf.getDate() - weekOf.getDay() + 1);
  weekOf.setHours(0, 0, 0, 0);

  const existingMatches = await Match.find({}).select('user1 user2').lean();
  const matchedPairs = new Set(
    existingMatches.map((m) => [m.user1.toString(), m.user2.toString()].sort().join('-'))
  );

  const results: { user1: string; user2: string; score: number; breakdown: Record<string, number> }[] = [];

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const pairKey = [users[i]._id!.toString(), users[j]._id!.toString()].sort().join('-');
      const { score, breakdown } = await computeMatchScore(users[i], users[j]);

      const noveltyBonus = matchedPairs.has(pairKey) ? -15 : 10;
      const finalScore = Math.min(99, Math.max(1, score + noveltyBonus));

      results.push({
        user1: users[i]._id!.toString(),
        user2: users[j]._id!.toString(),
        score: finalScore,
        breakdown,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  const matchesPerUser = new Map<string, number>();
  const newMatches = [];

  for (const result of results) {
    const u1Count = matchesPerUser.get(result.user1) || 0;
    const u2Count = matchesPerUser.get(result.user2) || 0;

    if (u1Count >= 2 || u2Count >= 2) continue;

    const existsThisWeek = await Match.findOne({
      $or: [
        { user1: result.user1, user2: result.user2, weekOf },
        { user1: result.user2, user2: result.user1, weekOf },
      ],
    });

    if (existsThisWeek) continue;

    const match = await Match.create({
      user1: result.user1,
      user2: result.user2,
      weekOf,
      score: result.score,
      scoreBreakdown: result.breakdown,
    });

    newMatches.push(match);
    matchesPerUser.set(result.user1, u1Count + 1);
    matchesPerUser.set(result.user2, u2Count + 1);
  }

  return { matched: newMatches.length, weekOf };
}
