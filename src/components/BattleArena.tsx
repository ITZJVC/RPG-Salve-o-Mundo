import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Crosshair,
  Flame,
  Heart,
  Pause,
  Shield,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import {
  ARENA_BACKDROP_URL,
  BOSS_WAGNER,
  BossMove,
  HeroDefinition,
} from '../data/characters';
import { sound } from '../utils/sound';
import { CharacterPortrait, PortraitAnim } from './CharacterPortrait';
import { EndModal } from './EndModal';

interface BattleArenaProps {
  hero: HeroDefinition;
  highScore: number;
  onUpdateHighScore: (newScore: number) => boolean;
  onBackToTitle: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

type TurnPhase = 'PLAYER_CHOICE' | 'RESOLVING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

interface FloatingPopup {
  id: number;
  target: 'hero' | 'boss';
  text: string;
  tone: 'damage' | 'crit' | 'heal' | 'dodge' | 'block' | 'focus';
}

function pickNextBossMove(bossHp: number, lastMoveType: 'attack' | 'charge' | null, turn: number): BossMove {
  const isPhase2 = bossHp <= BOSS_WAGNER.maxHp * 0.5;
  const availableAttacks = BOSS_WAGNER.moves.filter(
    (m) => m.type === 'attack' && (!m.phase2Only || isPhase2)
  );
  const chargeMoves = BOSS_WAGNER.moves.filter((m) => m.type === 'charge');

  if (turn === 1 || lastMoveType === 'charge') {
    return availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
  }

  if (Math.random() < 0.32) {
    return chargeMoves[Math.floor(Math.random() * chargeMoves.length)];
  }
  return availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
}

export function BattleArena({
  hero,
  highScore,
  onUpdateHighScore,
  onBackToTitle,
  muted,
  onToggleMute,
}: BattleArenaProps) {
  const [heroHp, setHeroHp] = useState(hero.maxHp);
  const [bossHp, setBossHp] = useState(BOSS_WAGNER.maxHp);
  const [specialCharge, setSpecialCharge] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [potions, setPotions] = useState(hero.potions);
  const [turn, setTurn] = useState(1);
  const [score, setScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const [dodgesCount, setDodgesCount] = useState(0);
  const [focusCount, setFocusCount] = useState(0);
  const [specialsCount, setSpecialsCount] = useState(0);

  const [phase, setPhase] = useState<TurnPhase>('PLAYER_CHOICE');
  const [bossIntent, setBossIntent] = useState<BossMove>(() => pickNextBossMove(BOSS_WAGNER.maxHp, null, 1));
  const [battleLog, setBattleLog] = useState<string>(
    `Prof. Wagner Suantos ligou o Mega Computador! Escolha Ataque, Defesa, Foco, Especial ou Desviar.`
  );

  const [heroAnim, setHeroAnim] = useState<PortraitAnim>('idle');
  const [bossAnim, setBossAnim] = useState<PortraitAnim>('idle');
  const [popups, setPopups] = useState<FloatingPopup[]>([]);

  const timeoutsRef = useRef<number[]>([]);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  const spawnPopup = useCallback(
    (target: 'hero' | 'boss', text: string, tone: FloatingPopup['tone']) => {
      const id = Date.now() + Math.random();
      setPopups((prev) => [...prev, { id, target, text, tone }]);
      scheduleTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, 950);
    },
    [scheduleTimeout]
  );

  const resetBattle = useCallback(() => {
    clearAllTimeouts();
    setHeroHp(hero.maxHp);
    setBossHp(BOSS_WAGNER.maxHp);
    setSpecialCharge(0);
    setIsFocused(false);
    setPotions(hero.potions);
    setTurn(1);
    setScore(0);
    setIsNewRecord(false);
    setDodgesCount(0);
    setFocusCount(0);
    setSpecialsCount(0);
    setPhase('PLAYER_CHOICE');
    setBossIntent(pickNextBossMove(BOSS_WAGNER.maxHp, null, 1));
    setBattleLog(`Nova batalha iniciada! ${hero.name} encara o Mega Computador de Wagner Suantos.`);
    setHeroAnim('idle');
    setBossAnim('idle');
    setPopups([]);
    sound.playClick();
  }, [clearAllTimeouts, hero]);

  const finishBattle = useCallback(
    (result: 'VICTORY' | 'GAME_OVER', finalScore: number) => {
      const recordBroken = onUpdateHighScore(finalScore);
      setIsNewRecord(recordBroken);
      if (result === 'VICTORY') {
        sound.playVictory();
      } else {
        sound.playGameOver();
      }
      setPhase(result);
    },
    [onUpdateHighScore]
  );

  const executeBossTurn = useCallback(
    (
      currentHeroHp: number,
      currentBossHp: number,
      currentScore: number,
      stance: 'none' | 'dodge' | 'defend' | 'stunned',
      intent: BossMove,
      currentTurn: number
    ) => {
      if (currentBossHp <= 0) {
        const winBonus = 500 + currentHeroHp * 4;
        const total = currentScore + winBonus;
        setScore(total);
        finishBattle('VICTORY', total);
        return;
      }

      scheduleTimeout(() => {
        if (stance === 'stunned') {
          setBattleLog(
            `O Poder Especial interrompeu ${intent.name} de Wagner Suantos! Prepare-se para o próximo turno.`
          );
          const nextMove = pickNextBossMove(currentBossHp, 'charge', currentTurn + 1);
          setBossIntent(nextMove);
          if (nextMove.type === 'attack') sound.playWarning();
          setTurn((t) => t + 1);
          setPhase('PLAYER_CHOICE');
          return;
        }

        if (intent.type === 'charge') {
          setBattleLog(`${intent.name}: Wagner Suantos está recarregando e não atacou neste turno.`);
          const nextMove = pickNextBossMove(currentBossHp, 'charge', currentTurn + 1);
          setBossIntent(nextMove);
          if (nextMove.type === 'attack') sound.playWarning();
          setTurn((t) => t + 1);
          setPhase('PLAYER_CHOICE');
          return;
        }

        setBossAnim('attack-left');
        scheduleTimeout(() => setBossAnim('idle'), 280);

        if (stance === 'dodge') {
          sound.playDodge();
          setHeroAnim('dodge');
          scheduleTimeout(() => setHeroAnim('idle'), 320);
          spawnPopup('hero', 'DESVIOU! 0', 'dodge');
          const dodgeBonus = 150;
          const updatedScore = currentScore + dodgeBonus;
          setScore(updatedScore);
          setDodgesCount((d) => d + 1);
          setSpecialCharge((c) => Math.min(100, c + 20));
          setBattleLog(
            `${hero.dodgeFlavor} Dano de ${intent.name} anulado (0 de dano) · +20% Carga Especial!`
          );

          const nextMove = pickNextBossMove(currentBossHp, 'attack', currentTurn + 1);
          scheduleTimeout(() => {
            setBossIntent(nextMove);
            if (nextMove.type === 'attack') sound.playWarning();
            setTurn((t) => t + 1);
            setPhase('PLAYER_CHOICE');
          }, 520);
          return;
        }

        const rawDamage = intent.damage;
        const mitigated =
          stance === 'defend'
            ? Math.max(2, Math.round(rawDamage * 0.4) - Math.floor(hero.defense / 2))
            : Math.max(5, rawDamage - Math.floor(hero.defense / 3));

        const nextHeroHp = Math.max(0, currentHeroHp - mitigated);
        setHeroHp(nextHeroHp);
        setHeroAnim('hit');
        scheduleTimeout(() => setHeroAnim('idle'), 280);

        if (stance === 'defend') {
          sound.playDefend();
          spawnPopup('hero', `-${mitigated} (Defesa)`, 'block');
          setBattleLog(
            `${hero.defendFlavor} Recebeu apenas ${mitigated} de dano de ${intent.name}.`
          );
        } else {
          sound.playEnemyHit();
          spawnPopup('hero', `-${mitigated}`, 'damage');
          setBattleLog(
            `Wagner Suantos usou ${intent.name} e causou ${mitigated} de dano em ${hero.name}!`
          );
        }

        if (nextHeroHp <= 0) {
          scheduleTimeout(() => finishBattle('GAME_OVER', currentScore), 620);
          return;
        }

        const nextMove = pickNextBossMove(currentBossHp, 'attack', currentTurn + 1);
        scheduleTimeout(() => {
          setBossIntent(nextMove);
          if (nextMove.type === 'attack') sound.playWarning();
          setTurn((t) => t + 1);
          setPhase('PLAYER_CHOICE');
        }, 560);
      }, 540);
    },
    [finishBattle, hero, scheduleTimeout, spawnPopup]
  );

  // 1. ATAQUE
  const handleAttack = useCallback(() => {
    if (phase !== 'PLAYER_CHOICE') return;
    setPhase('RESOLVING');

    const dmg = isFocused ? Math.round(hero.baseAttack * 1.5) : hero.baseAttack;
    const ptsGain = isFocused ? 180 : 120;
    const nextCharge = Math.min(100, specialCharge + 25);
    const nextBossHp = Math.max(0, bossHp - dmg);
    const nextScore = score + ptsGain;

    sound.playAttack(isFocused);
    setHeroAnim('attack-right');
    scheduleTimeout(() => setHeroAnim('idle'), 260);
    setBossAnim('hit');
    scheduleTimeout(() => setBossAnim('idle'), 280);

    spawnPopup('boss', isFocused ? `-${dmg} FOCADO!` : `-${dmg}`, isFocused ? 'crit' : 'damage');
    setBattleLog(
      isFocused
        ? `${hero.name} desferiu ${hero.basicMoveName} com Foco! ${dmg} de dano (+25% Carga Especial).`
        : `${hero.name} usou ${hero.basicMoveName} e causou ${dmg} de dano (+25% Carga Especial).`
    );

    setIsFocused(false);
    setBossHp(nextBossHp);
    setSpecialCharge(nextCharge);
    setScore(nextScore);

    executeBossTurn(heroHp, nextBossHp, nextScore, 'none', bossIntent, turn);
  }, [
    bossHp,
    bossIntent,
    executeBossTurn,
    hero,
    heroHp,
    isFocused,
    phase,
    scheduleTimeout,
    score,
    spawnPopup,
    specialCharge,
    turn,
  ]);

  // 2. DEFESA
  const handleDefend = useCallback(() => {
    if (phase !== 'PLAYER_CHOICE') return;
    setPhase('RESOLVING');
    sound.playDefend();
    setSpecialCharge((c) => Math.min(100, c + 15));
    setScore((s) => s + 60);
    setBattleLog(`${hero.defendFlavor} (+15% Carga Especial)`);
    executeBossTurn(heroHp, bossHp, score + 60, 'defend', bossIntent, turn);
  }, [bossHp, bossIntent, executeBossTurn, hero.defendFlavor, heroHp, phase, score, turn]);

  // 3. FOCO
  const handleFocus = useCallback(() => {
    if (phase !== 'PLAYER_CHOICE') return;
    setPhase('RESOLVING');
    sound.playHeal();

    const nextCharge = Math.min(100, specialCharge + 40);
    const smallHeal = isFocused ? 10 : 0;
    const nextHeroHp = Math.min(hero.maxHp, heroHp + smallHeal);
    const nextScore = score + 90;

    setIsFocused(true);
    setSpecialCharge(nextCharge);
    setHeroHp(nextHeroHp);
    setScore(nextScore);
    setFocusCount((f) => f + 1);

    spawnPopup('hero', 'FOCO +40% ESP.', 'focus');
    setBattleLog(
      isFocused
        ? `${hero.name} aprofundou o Foco! +40% Carga Especial, +10 HP e próximo ataque com +50% de dano.`
        : `${hero.name} concentrou Foco! +40% Carga Especial e o próximo Ataque ou Especial terá +50% de dano.`
    );

    executeBossTurn(nextHeroHp, bossHp, nextScore, 'none', bossIntent, turn);
  }, [
    bossHp,
    bossIntent,
    executeBossTurn,
    hero.maxHp,
    hero.name,
    heroHp,
    isFocused,
    phase,
    score,
    spawnPopup,
    specialCharge,
    turn,
  ]);

  // 4. ESPECIAL
  const handleSpecial = useCallback(() => {
    if (phase !== 'PLAYER_CHOICE' || specialCharge < 100) return;
    setPhase('RESOLVING');

    const dmg = isFocused
      ? Math.round(hero.specialBaseDamage * 1.5)
      : hero.specialBaseDamage;
    const nextBossHp = Math.max(0, bossHp - dmg);
    const nextScore = score + (isFocused ? 400 : 300);

    sound.playSpecial();
    setHeroAnim('attack-right');
    scheduleTimeout(() => setHeroAnim('idle'), 260);
    setBossAnim('hit');
    scheduleTimeout(() => setBossAnim('idle'), 280);

    spawnPopup('boss', `-${dmg} ESPECIAL!`, 'crit');
    setBattleLog(
      `${hero.name} lançou ${hero.specialMoveName}${isFocused ? ' com Foco' : ''}! ${dmg} de dano e interrompeu o ataque inimigo!`
    );

    setIsFocused(false);
    setSpecialCharge(0);
    setSpecialsCount((s) => s + 1);
    setBossHp(nextBossHp);
    setScore(nextScore);

    executeBossTurn(heroHp, nextBossHp, nextScore, 'stunned', bossIntent, turn);
  }, [
    bossHp,
    bossIntent,
    executeBossTurn,
    hero,
    heroHp,
    isFocused,
    phase,
    scheduleTimeout,
    score,
    spawnPopup,
    specialCharge,
    turn,
  ]);

  // 5. DESVIAR
  const handleDodge = useCallback(() => {
    if (phase !== 'PLAYER_CHOICE') return;
    setPhase('RESOLVING');
    sound.playClick();
    setBattleLog(
      `${hero.name} entrou em posição de esquiva para desviar do ataque neste turno...`
    );
    executeBossTurn(heroHp, bossHp, score, 'dodge', bossIntent, turn);
  }, [bossHp, bossIntent, executeBossTurn, hero.name, heroHp, phase, score, turn]);

  // 6. POÇÃO
  const handlePotion = useCallback(() => {
    if (phase !== 'PLAYER_CHOICE' || potions <= 0 || heroHp >= hero.maxHp) return;
    setPhase('RESOLVING');
    sound.playHeal();
    const healedHp = Math.min(hero.maxHp, heroHp + hero.potionHeal);
    const actualHeal = healedHp - heroHp;
    setHeroHp(healedHp);
    setPotions((p) => p - 1);
    spawnPopup('hero', `+${actualHeal} HP`, 'heal');
    setBattleLog(`${hero.name} usou ${hero.potionName} e recuperou ${actualHeal} de vida!`);
    executeBossTurn(healedHp, bossHp, score, 'none', bossIntent, turn);
  }, [bossHp, bossIntent, executeBossTurn, hero, heroHp, phase, potions, score, spawnPopup, turn]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phase === 'PLAYER_CHOICE') setPhase('PAUSED');
        else if (phase === 'PAUSED') setPhase('PLAYER_CHOICE');
        return;
      }

      if (phase === 'PLAYER_CHOICE') {
        if (e.key === '1') handleAttack();
        else if (e.key === '2') handleDefend();
        else if (e.key === '3') handleFocus();
        else if (e.key === '4' && specialCharge >= 100) handleSpecial();
        else if (e.key === '5') handleDodge();
        else if (e.key === '6') handlePotion();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleAttack,
    handleDefend,
    handleDodge,
    handleFocus,
    handlePotion,
    handleSpecial,
    phase,
    specialCharge,
  ]);

  const heroHpPct = Math.round((heroHp / hero.maxHp) * 100);
  const bossHpPct = Math.round((bossHp / BOSS_WAGNER.maxHp) * 100);
  const bossPhase2 = bossHp <= BOSS_WAGNER.maxHp * 0.5;
  const isBossAttackWarning = bossIntent.type === 'attack';

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-x-hidden bg-slate-950">
      {/* Arena Illustrated Backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <img
          src={ARENA_BACKDROP_URL}
          alt="Arena do Mega Computador"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/60 to-slate-950/95" />
      </div>

      {/* Top Perimeter HUD */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 pt-4 sm:px-6">
        <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
          <span className="font-display text-sm font-bold text-slate-100">
            Turno <span className="font-mono tabular-nums text-amber-400">{turn}</span>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono tabular-nums">
            Pontos: <strong className="text-slate-100">{score}</strong>
          </span>
          <span aria-hidden="true" className="hidden text-slate-600 sm:inline">·</span>
          <span className="hidden font-mono tabular-nums text-slate-400 sm:inline">
            Recorde: {highScore}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
            aria-label={muted ? 'Ativar som' : 'Silenciar som'}
          >
            {muted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
            <span className="hidden sm:inline">{muted ? 'Mudo' : 'Som'}</span>
          </button>

          <button
            type="button"
            onClick={() => setPhase('PAUSED')}
            className="flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Pause className="h-4 w-4" />
            <span>Pausar</span>
          </button>
        </div>
      </header>

      {/* Enemy Telegraph / Attack Warning Banner */}
      <div className="relative z-10 mx-auto mt-3 w-full max-w-5xl px-4 sm:px-6">
        {isBossAttackWarning ? (
          <div className="flex flex-col justify-between gap-2 rounded-xl border border-amber-500/60 bg-amber-950/75 px-4 py-3 text-amber-100 shadow-lg sm:flex-row sm:items-center">
            <div className="flex items-start gap-3 sm:items-center">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400 sm:mt-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-amber-300">AVISO DE ATAQUE: </span>
                <span>
                  Wagner Suantos vai usar <strong className="text-white">{bossIntent.name}</strong> (
                  <span className="font-mono tabular-nums font-bold text-rose-300">{bossIntent.damage} de dano</span>) no fim deste turno!
                </span>
              </div>
            </div>
            <div className="font-mono text-xs font-semibold text-emerald-300 whitespace-nowrap shrink-0">
              Use Desviar (5) para anular 100%
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-slate-900/85 px-4 py-3 text-xs text-slate-300 sm:text-sm">
            <div>
              <span className="font-semibold text-emerald-300">Janela Livre: </span>
              <span>
                {bossIntent.name} — Wagner Suantos não atacará neste turno. Aproveite para usar Foco, Ataque ou Poção!
              </span>
            </div>
            <code className="hidden rounded bg-slate-950 px-2 py-1 font-mono text-xs text-slate-400 md:block">
              {bossIntent.codePreview}
            </code>
          </div>
        )}
      </div>

      {/* Main Arena Stage: Hero (Left) vs Professor Wagner Suantos (Right) */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10">
          {/* Player Hero Card */}
          <section className="relative flex flex-col rounded-2xl border border-slate-800/90 bg-slate-900/85 p-4 shadow-xl">
            <div className="pointer-events-none absolute top-3 right-4 z-20 flex flex-col items-end gap-1">
              {popups
                .filter((p) => p.target === 'hero')
                .map((p) => (
                  <span
                    key={p.id}
                    className={`animate-float-damage font-mono text-lg font-bold tabular-nums ${
                      p.tone === 'dodge'
                        ? 'text-cyan-300'
                        : p.tone === 'heal'
                          ? 'text-emerald-400'
                          : p.tone === 'focus'
                            ? 'text-violet-300'
                            : p.tone === 'block'
                              ? 'text-amber-300'
                              : 'text-rose-400'
                    }`}
                  >
                    {p.text}
                  </span>
                ))}
            </div>

            <div className="flex items-center gap-4">
              <CharacterPortrait
                src={hero.portraitUrl}
                alt={hero.name}
                variant={hero.id}
                anim={heroAnim}
                className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-400">
                  Herói · {hero.title}
                </div>
                <h2 className="font-display text-xl font-bold text-slate-50 truncate">
                  {hero.name}
                </h2>

                {/* HP Bar */}
                <div className="mt-2.5">
                  <div className="mb-1 flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Heart className="h-3.5 w-3.5 text-emerald-400" />
                      Vida (HP)
                    </span>
                    <span className="font-mono tabular-nums text-slate-100">
                      {heroHp} / {hero.maxHp} · {heroHpPct > 40 ? 'ESTÁVEL' : 'CRÍTICO'}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-md bg-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        heroHpPct > 50
                          ? 'bg-emerald-500'
                          : heroHpPct > 25
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${heroHpPct}%` }}
                    />
                  </div>
                </div>

                {/* Special Charge Gauge */}
                <div className="mt-2.5">
                  <div className="mb-1 flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      Poder Especial
                    </span>
                    <span className="font-mono tabular-nums text-amber-300">
                      {specialCharge}% {specialCharge >= 100 ? '· PRONTO!' : ''}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-md bg-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        specialCharge >= 100 ? 'bg-amber-400' : 'bg-amber-500/80'
                      }`}
                      style={{ width: `${specialCharge}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2.5 text-xs text-slate-400">
              <span className="font-mono tabular-nums">
                Ataque: {hero.baseAttack} · Defesa: {hero.defense}
                {isFocused && (
                  <strong className="ml-2 text-violet-300">· Foco Ativo (+50% Dano)</strong>
                )}
              </span>
              <span className="font-mono tabular-nums text-emerald-300">
                Poções: {potions}
              </span>
            </div>
          </section>

          {/* Villain Boss Card: Professor Wagner Suantos */}
          <section className="relative flex flex-col rounded-2xl border border-rose-900/50 bg-slate-900/85 p-4 shadow-xl">
            <div className="pointer-events-none absolute top-3 right-4 z-20 flex flex-col items-end gap-1">
              {popups
                .filter((p) => p.target === 'boss')
                .map((p) => (
                  <span
                    key={p.id}
                    className={`animate-float-damage font-mono text-lg font-bold tabular-nums ${
                      p.tone === 'crit'
                        ? 'text-amber-300'
                        : p.tone === 'block'
                          ? 'text-slate-300'
                          : 'text-emerald-300'
                    }`}
                  >
                    {p.text}
                  </span>
                ))}
            </div>

            <div className="flex items-center gap-4">
              <CharacterPortrait
                src={BOSS_WAGNER.portraitUrl}
                alt={BOSS_WAGNER.name}
                variant="wagner"
                anim={bossAnim}
                className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-rose-300">
                  Chefe Final · {bossPhase2 ? 'Modo Overclock IA' : 'Informática Maligna'}
                </div>
                <h2 className="font-display text-xl font-bold text-slate-50 truncate">
                  {BOSS_WAGNER.name}
                </h2>

                {/* Boss HP Bar */}
                <div className="mt-2.5">
                  <div className="mb-1 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-300">Integridade da IA</span>
                    <span className="font-mono tabular-nums text-slate-100">
                      {bossHp} / {BOSS_WAGNER.maxHp} ({bossHpPct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-md bg-slate-800">
                    <div
                      className="h-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${bossHpPct}%` }}
                    />
                  </div>
                </div>

                {/* Boss Next Move Preview */}
                <div className="mt-2.5 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1.5 text-xs">
                  <div className="text-slate-400">
                    Próxima Ação:{' '}
                    <span className="font-semibold text-slate-100">{bossIntent.name}</span>
                  </div>
                  <code className="mt-0.5 block truncate font-mono text-[11px] text-rose-300/90">
                    {bossIntent.codePreview}
                  </code>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2.5 text-xs text-slate-400">
              <span>{BOSS_WAGNER.title}</span>
              <span className="font-mono tabular-nums text-rose-300">
                {isBossAttackWarning ? `Dano previsto: ${bossIntent.damage}` : 'Sem ataque agora'}
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Action Deck + Battle Log */}
      <footer className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-5 sm:px-6">
        <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs text-slate-200 sm:text-sm">
          {battleLog}
        </div>

        {/* Turn Command Deck: Ataque, Defesa, Foco, Especial, Desviar e Poção */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <button
            type="button"
            disabled={phase !== 'PLAYER_CHOICE'}
            onClick={handleAttack}
            className="flex min-h-[58px] flex-col items-start justify-center rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2.5 text-left transition-colors hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="flex items-center gap-1.5 text-sm font-bold text-amber-300 whitespace-nowrap">
              <Swords className="h-4 w-4" />
              Ataque (1)
            </span>
            <span className="mt-0.5 w-full truncate text-[11px] text-slate-300">
              {isFocused ? `${Math.round(hero.baseAttack * 1.5)} dano` : `${hero.baseAttack} dano`} · +25% Esp.
            </span>
          </button>

          <button
            type="button"
            disabled={phase !== 'PLAYER_CHOICE'}
            onClick={handleDefend}
            className="flex min-h-[58px] flex-col items-start justify-center rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-100 whitespace-nowrap">
              <Shield className="h-4 w-4 text-slate-300" />
              Defesa (2)
            </span>
            <span className="mt-0.5 w-full truncate text-[11px] text-slate-400">
              Reduz 60% dano · +15% Esp.
            </span>
          </button>

          <button
            type="button"
            disabled={phase !== 'PLAYER_CHOICE'}
            onClick={handleFocus}
            className={`flex min-h-[58px] flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
              isFocused
                ? 'border-violet-400/70 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30'
                : 'border-violet-500/40 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25'
            }`}
          >
            <span className="flex items-center gap-1.5 text-sm font-bold text-violet-300 whitespace-nowrap">
              <Crosshair className="h-4 w-4" />
              Foco (3)
            </span>
            <span className="mt-0.5 w-full truncate text-[11px] text-slate-300">
              +40% Esp. · Próx. +50% Dano
            </span>
          </button>

          <button
            type="button"
            disabled={phase !== 'PLAYER_CHOICE' || specialCharge < 100}
            onClick={handleSpecial}
            className={`flex min-h-[58px] flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
              specialCharge >= 100
                ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400'
                : 'border-slate-700 bg-slate-900/90 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5 text-sm font-bold whitespace-nowrap">
              <Flame className="h-4 w-4" />
              Especial (4)
            </span>
            <span
              className={`mt-0.5 w-full truncate text-[11px] ${
                specialCharge >= 100 ? 'font-semibold text-slate-900' : 'text-slate-400'
              }`}
            >
              {specialCharge >= 100 ? hero.specialMoveName : `Carga: ${specialCharge}%`}
            </span>
          </button>

          <button
            type="button"
            disabled={phase !== 'PLAYER_CHOICE'}
            onClick={handleDodge}
            className={`flex min-h-[58px] flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
              isBossAttackWarning
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30'
                : 'border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5 text-sm font-bold text-cyan-300 whitespace-nowrap">
              <Wind className="h-4 w-4" />
              Desviar (5)
            </span>
            <span className="mt-0.5 w-full truncate text-[11px] text-slate-300">
              Anula 100% do ataque
            </span>
          </button>

          <button
            type="button"
            disabled={phase !== 'PLAYER_CHOICE' || potions <= 0 || heroHp >= hero.maxHp}
            onClick={handlePotion}
            className="flex min-h-[58px] flex-col items-start justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2.5 text-left transition-colors hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-300 whitespace-nowrap">
              <Heart className="h-4 w-4" />
              Poção (6)
            </span>
            <span className="mt-0.5 w-full truncate text-[11px] text-slate-300">
              +{hero.potionHeal} HP · Restam {potions}
            </span>
          </button>
        </div>
      </footer>

      {/* Pause / Victory / Game Over Modal */}
      {(phase === 'VICTORY' || phase === 'GAME_OVER' || phase === 'PAUSED') && (
        <EndModal
          outcome={
            phase === 'VICTORY' ? 'victory' : phase === 'GAME_OVER' ? 'gameover' : 'paused'
          }
          hero={hero}
          score={score}
          highScore={Math.max(highScore, score)}
          isNewRecord={isNewRecord}
          turns={turn}
          dodgesCount={dodgesCount}
          focusCount={focusCount}
          specialsCount={specialsCount}
          onResume={() => setPhase('PLAYER_CHOICE')}
          onPlayAgain={resetBattle}
          onBackToTitle={onBackToTitle}
        />
      )}
    </div>
  );
}
