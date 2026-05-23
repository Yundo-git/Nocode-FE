interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  status: string;
  progress: number;
}

// 프로젝트 정보를 보여주는 카드 컴포넌트입니다.
// 제목, 설명, 태그, 상태, 진행률을 화면에 표시합니다.
export function ProjectCard({
  title,
  description,
  tags,
  status,
  progress,
}: ProjectCardProps) {
  return (
    <article className="card group">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        </div>
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
          {status}
        </span>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>진행률</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </article>
  );
}
