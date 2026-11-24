import { RotateCcw, ShieldAlert, Trophy, Home } from 'lucide-react';
import { HeroDefinition } from '../data/characters';

interface EndModalProps {
  outcome: 'victory' | 'gameover' | 'paused';
  hero: HeroDefinition;
  score: number;
  highScore: number;
  isNewRecord: boolean;
  turns: number;
  dodgesCount: number;
  focusCount: number;
  specialsCount: number;
  onResume?: () => void;
  onPlayAgain: () => void;
  onBackToTitle: () => void;
}

export function EndModal({
  outcome,
  hero,
  score,
  highScore,
  isNewRecord,
  turns,
  dodgesCount,
  focusCount,
  specialsCount,
  onResume,
  onPlayAgain,
  onBackToTitle,
}: EndModalProps) {
  const isVictory = outcome === 'victory';
  const isPaused = outcome === 'paused';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          {isVictory && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Trophy className="h-6 w-6" />
            </div>
          )}
          {outcome === 'gameover' && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
          )}
          <div>
            <div className="text-xs font-medium text-slate-400">
              {isVictory
                ? `Vitória de ${hero.name}`
                : isPaused
                  ? 'Jogo Pausado'
                  : 'Fim de Jogo · Derrota'}
            </div>
            <h2 className="font-display text-2xl font-extrabold text-slate-50">
              {isVictory
                ? 'Você Salvou o Mundo!'
                : isPaused
                  ? 'Batalha em Pausa'
                  : 'A IA Dominou o Mundo!'}
            </h2>
          </div>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-slate-300">
          {isVictory
            ? `${hero.name} derrotou o Professor Wagner Suantos e desligou o Mega Computador de IA a tempo. A humanidade está a salvo!`
            : isPaused
              ? 'Revise sua estratégia: use Foco para carregar o Especial e ampliar seu próximo ataque, Defesa para reduzir danos e Desviar sempre que houver Aviso de Ataque.'
              : 'Seus pontos de vida chegaram a zero. O Professor maligno Wagner Suantos conectou o Mega Computador às redes globais e a IA assumiu o controle do mundo. Tente novamente para impedir a dominação!'}
        </p>

        {!isPaused && (
          <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
            <div>
              <div className="text-slate-400">Pontuação Final</div>
              <div className="mt-0.5 font-mono text-lg font-bold tabular-nums text-amber-400">
                {score} pts
              </div>
              {isNewRecord && (
                <div className="mt-0.5 font-semibold text-emerald-400">Novo Recorde!</div>
              )}
            </div>
            <div>
              <div className="text-slate-400">Recorde Salvo</div>
              <div className="mt-0.5 font-mono text-lg font-bold tabular-nums text-slate-100">
                {highScore} pts
              </div>
            </div>
            <div className="border-t border-slate-800/80 pt-2.5">
              <div className="text-slate-400">Turnos / Esquivas</div>
              <div className="mt-0.5 font-mono font-semibold tabular-nums text-slate-200">
                {turns} turnos · {dodgesCount} desvios
              </div>
            </div>
            <div className="border-t border-slate-800/80 pt-2.5">
              <div className="text-slate-400">Foco / Especiais</div>
              <div className="mt-0.5 font-mono font-semibold tabular-nums text-slate-200">
                {focusCount} focos · {specialsCount} especiais
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBackToTitle}
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 whitespace-nowrap shrink-0"
          >
            <Home className="h-4 w-4" />
            <span>Menu Principal</span>
          </button>

          {isPaused && onResume ? (
            <button
              type="button"
              onClick={onResume}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0"
            >
              <span>Continuar Batalha</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Jogar Novamente</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
