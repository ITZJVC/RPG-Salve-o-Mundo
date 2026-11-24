import { useEffect } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { ARENA_BACKDROP_URL, HEROES, HeroId } from '../data/characters';
import { CharacterPortrait } from './CharacterPortrait';

interface TitleScreenProps {
  selectedHero: HeroId;
  onSelectHero: (id: HeroId) => void;
  onStartRpg: () => void;
  rpgHighScore: number;
  muted: boolean;
  onToggleMute: () => void;
}

export function TitleScreen({
  selectedHero,
  onSelectHero,
  onStartRpg,
  rpgHighScore,
  muted,
  onToggleMute,
}: TitleScreenProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'BUTTON') return;
        e.preventDefault();
        onStartRpg();
      } else if (e.key === '1') {
        onSelectHero('andrey');
      } else if (e.key === '2') {
        onSelectHero('celso');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSelectHero, onStartRpg]);

  const heroList = [HEROES.andrey, HEROES.celso];

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-x-hidden bg-slate-950">
      {/* Arena Illustrated Key-Art Backdrop with calm scrim */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <img
          src={ARENA_BACKDROP_URL}
          alt="Laboratório do Mega Computador de IA"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-slate-950/95" />
      </div>

      {/* Top Perimeter Utility Bar (Audio + High Score) */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
          <span className="font-mono tabular-nums text-slate-300">
            Recorde de Batalha: {rpgHighScore} pts
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          className="flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400"
          aria-label={muted ? 'Ativar som' : 'Silenciar som'}
        >
          {muted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
          <span>{muted ? 'Som Desligado' : 'Som Ativo'}</span>
        </button>
      </header>

      {/* Center Stage: Title Lockup + Hero Selection */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-6">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left: Bespoke SVG Emblem & Narrative Hook */}
          <div className="flex flex-col items-start lg:col-span-5">
            <svg
              viewBox="0 0 380 86"
              className="mb-4 w-full max-w-[360px]"
              role="img"
              aria-label="Código versus Sabedoria"
            >
              <defs>
                <linearGradient id="titleGold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <path
                d="M6 12 L24 6 L42 12 V34 C42 48 24 58 24 58 C24 58 6 48 6 34 Z"
                fill="#1E293B"
                stroke="url(#titleGold)"
                strokeWidth="2.5"
              />
              <path
                d="M17 24 L24 31 L33 19"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="58"
                y="34"
                fill="#F8FAFC"
                fontFamily="Bricolage Grotesque, sans-serif"
                fontWeight="800"
                fontSize="27"
                letterSpacing="-0.02em"
              >
                Código vs. Sabedoria
              </text>
              <text
                x="58"
                y="60"
                fill="#FBBF24"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="600"
                fontSize="14.5"
              >
                A Batalha Contra a IA de Wagner Suantos
              </text>
            </svg>

            <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-300 md:text-base">
              O maligno <strong className="text-slate-100">Professor Wagner Suantos</strong> ativou seu Mega Computador de IA para dominar o mundo. Escolha seu herói e comande turnos táticos com <strong className="text-amber-300">Ataque, Defesa, Foco, Especial, Poções e Esquiva</strong> para derrotá-lo e salvar a humanidade.
            </p>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={onStartRpg}
              className="flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Iniciar Batalha RPG</span>
            </button>
          </div>

          {/* Right: Playable Character Selection (Andrey vs Celso Escolinha de Futebol) */}
          <div className="lg:col-span-7">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-slate-100">
                Escolha seu Herói
              </h2>
              <span className="text-xs text-slate-400">
                Andrey ou Celso Escolinha de Futebol
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {heroList.map((hero, idx) => {
                const isSelected = selectedHero === hero.id;
                const borderAccent = isSelected
                  ? hero.id === 'andrey'
                    ? 'border-amber-400 bg-slate-900/95 ring-1 ring-amber-400/50'
                    : 'border-emerald-400 bg-slate-900/95 ring-1 ring-emerald-400/50'
                  : 'border-slate-800 bg-slate-900/75 hover:border-slate-600';

                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => onSelectHero(hero.id)}
                    aria-pressed={isSelected}
                    className={`group flex flex-col rounded-2xl border p-4 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-amber-400 ${borderAccent}`}
                  >
                    <div className="mb-3 flex items-center gap-3.5">
                      <CharacterPortrait
                        src={hero.portraitUrl}
                        alt={hero.name}
                        variant={hero.id}
                        className="h-20 w-20 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-400">
                          Tecla {idx + 1} · {isSelected ? 'Selecionado' : 'Disponível'}
                        </div>
                        <h3 className="font-display text-lg font-bold leading-snug text-slate-50">
                          {hero.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-300">
                          {hero.title}
                        </p>
                      </div>
                    </div>

                    <p className="mb-3 text-xs leading-relaxed text-slate-300">
                      {hero.description}
                    </p>

                    <div className="mt-auto border-t border-slate-800 pt-2.5 text-xs text-slate-400">
                      <div className="flex items-center justify-between font-mono tabular-nums text-slate-200">
                        <span>HP {hero.maxHp} · ATQ {hero.baseAttack}</span>
                        <span>Poções {hero.potions}</span>
                      </div>
                      <div className="mt-1 truncate text-slate-400">
                        Especial: <span className="text-slate-200">{hero.specialMoveName}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Single flat control-hint line at bottom */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-5 text-center text-xs text-slate-400">
        1 / 2 Escolher Herói · Enter Iniciar Batalha · Na luta: Desvie sempre que Wagner emitir Aviso de Ataque
      </footer>
    </div>
  );
}
