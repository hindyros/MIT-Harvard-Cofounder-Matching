'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserRef {
  _id: string;
  name: string;
  school: string;
  profile?: { avatarUrl?: string; headline?: string };
}

interface ProjectDetail {
  _id: string;
  title: string;
  description: string;
  rolesNeeded: string[];
  tags: string[];
  status: string;
  school: string;
  createdBy: UserRef;
  interestedUsers: UserRef[];
  createdAt: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([projData, meData]) => {
      if (projData.success) setProject(projData.data);
      if (meData.success) setMeId(meData.data.id);
      setLoading(false);
    });
  }, [id]);

  const toggleInterest = useCallback(async () => {
    setToggling(true);
    const res = await fetch(`/api/projects/${id}/interest`, { method: 'POST' });
    const data = await res.json();
    if (data.success && project) {
      const newProject = { ...project };
      if (data.data.interested) {
        newProject.interestedUsers = [...newProject.interestedUsers, { _id: meId!, name: 'You', school: '', profile: {} }];
      } else {
        newProject.interestedUsers = newProject.interestedUsers.filter((u) => u._id !== meId);
      }
      setProject(newProject);
    }
    setToggling(false);
  }, [id, project, meId]);

  const handleMessage = useCallback(async (recipientId: string) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId }),
    });
    const data = await res.json();
    if (data.success) router.push(`/messages/${data.data.id}`);
  }, [router]);

  if (loading) return <div className="animate-pulse h-96 bg-surface-elevated rounded-xl" />;
  if (!project) return <div className="text-center py-16"><p className="text-text-secondary">Project not found.</p></div>;

  const isInterested = project.interestedUsers.some((u) => u._id === meId);
  const isCreator = project.createdBy._id === meId;

  return (
    <div className="animate-fade-in max-w-3xl">
      <Link href="/projects" className="text-text-secondary hover:text-text-primary text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
        Back to projects
      </Link>

      <div className="glass rounded-2xl p-8 mt-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${project.school === 'MIT' ? 'bg-mit/20 text-mit' : project.school === 'Harvard' ? 'bg-harvard/20 text-harvard' : 'bg-gold/20 text-gold'}`}>
                {project.school}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === 'seeking' ? 'bg-emerald-400/10 text-emerald-400' : project.status === 'in_progress' ? 'bg-blue-400/10 text-blue-400' : 'bg-surface-elevated text-text-tertiary'}`}>
                {project.status === 'seeking' ? 'Seeking Cofounders' : project.status === 'in_progress' ? 'In Progress' : 'Closed'}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display">{project.title}</h1>
          </div>
          {!isCreator && (
            <button
              onClick={toggleInterest}
              disabled={toggling}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                isInterested
                  ? 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
                  : 'bg-gold text-background hover:bg-gold-light'
              }`}
            >
              {isInterested ? 'Not Interested' : "I'm Interested"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Link href={`/profile/${project.createdBy._id}`} className="flex items-center gap-2 hover:text-gold transition-colors">
            {project.createdBy.profile?.avatarUrl ? (
              <img src={project.createdBy.profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-semibold">
                {project.createdBy.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{project.createdBy.name}</p>
              <p className="text-xs text-text-tertiary">{project.createdBy.school}</p>
            </div>
          </Link>
          <span className="text-xs text-text-tertiary ml-auto">
            Posted {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <p className="text-text-secondary leading-relaxed mb-6 whitespace-pre-wrap">{project.description}</p>

        {project.rolesNeeded.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-2">Roles Needed</h3>
            <div className="flex flex-wrap gap-2">
              {project.rolesNeeded.map((r) => (
                <span key={r} className="text-sm px-3 py-1 rounded-full border border-gold/30 text-gold-light">{r}</span>
              ))}
            </div>
          </div>
        )}

        {project.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span key={t} className="text-sm px-3 py-1 rounded-full bg-gold/10 text-gold-light">{t}</span>
              ))}
            </div>
          </div>
        )}

        {project.interestedUsers.length > 0 && (
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
              Interested ({project.interestedUsers.length})
            </h3>
            <div className="space-y-2">
              {project.interestedUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3">
                  <Link href={`/profile/${u._id}`} className="flex items-center gap-2 hover:text-gold transition-colors flex-1 min-w-0">
                    {u.profile?.avatarUrl ? (
                      <img src={u.profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-semibold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      {u.profile?.headline && <p className="text-xs text-text-tertiary truncate">{u.profile.headline}</p>}
                    </div>
                  </Link>
                  {u._id !== meId && (
                    <button
                      onClick={() => handleMessage(u._id)}
                      className="text-gold hover:text-gold-light text-xs font-medium transition-colors shrink-0"
                    >
                      Message
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
