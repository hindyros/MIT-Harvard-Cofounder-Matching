import { IUserProfile } from '@/lib/models/User';

export function generateIcebreaker(
  myProfile: Partial<IUserProfile> | undefined,
  theirProfile: Partial<IUserProfile> | undefined,
  theirName: string
): string {
  const mySkills = (myProfile?.skills || []).map((s) => s.toLowerCase());
  const theirSkills = (theirProfile?.skills || []).map((s) => s.toLowerCase());
  const myInterests = (myProfile?.interests || []).map((s) => s.toLowerCase());
  const theirInterests = (theirProfile?.interests || []).map((s) => s.toLowerCase());
  const myLookingFor = myProfile?.lookingFor || [];
  const theirLookingFor = theirProfile?.lookingFor || [];

  const sharedInterests = myInterests.filter((i) => theirInterests.includes(i));
  if (sharedInterests.length > 0) {
    const topic = sharedInterests[0];
    return `Hey ${theirName}! I noticed we're both interested in ${topic} — would love to hear what you're exploring in that space. Coffee sometime this week?`;
  }

  const sharedSkills = mySkills.filter((s) => theirSkills.includes(s));
  if (sharedSkills.length > 0) {
    const skill = sharedSkills[0];
    return `Hey ${theirName}! Looks like we both have experience with ${skill}. Would be great to compare notes — are you free for a quick coffee chat?`;
  }

  const mySkillSet = new Set(mySkills.map(categorize));
  const theirSkillSet = new Set(theirSkills.map(categorize));
  const complement = [...theirSkillSet].find((c) => c && !mySkillSet.has(c));
  if (complement && mySkillSet.size > 0) {
    const myCategory = [...mySkillSet].find(Boolean) || 'technical';
    return `Hey ${theirName}! Your ${complement} background caught my eye — I'm more on the ${myCategory} side. I think our skills could complement each other well. Interested in grabbing coffee?`;
  }

  if (myLookingFor.length > 0 && theirLookingFor.length > 0) {
    return `Hey ${theirName}! We matched this week on William x John. Looks like we're both looking for the right cofounder — I'd love to chat and see if there's a fit. Free for coffee?`;
  }

  if (theirProfile?.headline) {
    return `Hey ${theirName}! Your profile caught my eye — "${theirProfile.headline}". Would love to connect and hear more about what you're working on. Coffee this week?`;
  }

  return `Hey ${theirName}! We matched this week on William x John — would love to grab coffee and hear about what you're working on. When are you free?`;
}

function categorize(skill: string): string | null {
  const lower = skill.toLowerCase();
  const technical = ['python', 'javascript', 'react', 'typescript', 'node', 'aws', 'machine learning', 'ai', 'ml', 'engineering', 'software', 'backend', 'frontend', 'ios', 'android'];
  const business = ['sales', 'marketing', 'finance', 'strategy', 'operations', 'growth', 'fundraising', 'product management', 'consulting'];
  const design = ['ui', 'ux', 'product design', 'graphic design', 'figma', 'branding'];

  if (technical.some((k) => lower.includes(k))) return 'technical';
  if (business.some((k) => lower.includes(k))) return 'business';
  if (design.some((k) => lower.includes(k))) return 'design';
  return null;
}
