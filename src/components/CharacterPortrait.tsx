import { useState } from 'react';
import { BookOpen, Cpu, Trophy } from 'lucide-react';

export type PortraitAnim = 'idle' | 'attack-right' | 'attack-left' | 'hit' | 'dodge';

interface CharacterPortraitProps {
  src: string;
  alt: string;
  variant: 'andrey' | 'celso' | 'wagner';
  anim?: PortraitAnim;
  className?: string;
}

export function CharacterPortrait({
  src,
  alt,
  variant,
  anim = 'idle',
  className = '',
}: CharacterPortraitProps) {
  const [imgError, setImgError] = useState(false);

  const animClass =
    anim === 'attack-right'
      ? 'animate-lunge-right'
      : anim === 'attack-left'
        ? 'animate-lunge-left'
        : anim === 'hit'
          ? 'animate-hit-shake brightness-125'
          : anim === 'dodge'
            ? 'animate-dodge-slide'
            : '';

  const fallbackGradient =
    variant === 'andrey'
      ? 'from-amber-950/80 via-slate-900 to-slate-950'
      : variant === 'celso'
        ? 'from-emerald-950/80 via-slate-900 to-slate-950'
        : 'from-rose-950/80 via-slate-900 to-slate-950';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900 transition-transform duration-200 ${animClass} ${className}`}
    >
      {!imgError ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-top select-none"
          draggable={false}
        />
      ) : (
        <div
          className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${fallbackGradient} p-4 text-center`}
        >
          {variant === 'andrey' && <BookOpen className="mb-2 h-10 w-10 text-amber-400" />}
          {variant === 'celso' && <Trophy className="mb-2 h-10 w-10 text-emerald-400" />}
          {variant === 'wagner' && <Cpu className="mb-2 h-10 w-10 text-rose-400" />}
          <span className="font-display text-sm font-bold text-slate-100">{alt}</span>
        </div>
      )}
    </div>
  );
}
