/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { BattleArena } from './components/BattleArena';
import { TitleScreen } from './components/TitleScreen';
import { HEROES, HeroId } from './data/characters';
import { sound } from './utils/sound';

type ScreenState = 'TITLE_MENU' | 'PLAYING_RPG';

function readStoredScore(key: string): number {
  try {
    const val = localStorage.getItem(key);
    const num = val ? parseInt(val, 10) : 0;
    return Number.isFinite(num) && num > 0 ? num : 0;
  } catch {
    return 0;
  }
}

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('TITLE_MENU');
  const [selectedHero, setSelectedHero] = useState<HeroId>('andrey');
  const [rpgHighScore, setRpgHighScore] = useState<number>(() => readStoredScore('rpg_high_score'));
  const [muted, setMuted] = useState<boolean>(() => sound.isMuted());

  const handleToggleMute = useCallback(() => {
    setMuted(sound.toggleMute());
  }, []);

  const handleUpdateRpgHighScore = useCallback(
    (newScore: number): boolean => {
      if (newScore > rpgHighScore) {
        setRpgHighScore(newScore);
        try {
          localStorage.setItem('rpg_high_score', String(newScore));
        } catch {
          // Ignore storage errors
        }
        return true;
      }
      return false;
    },
    [rpgHighScore]
  );

  if (screen === 'PLAYING_RPG') {
    return (
      <BattleArena
        hero={HEROES[selectedHero]}
        highScore={rpgHighScore}
        onUpdateHighScore={handleUpdateRpgHighScore}
        onBackToTitle={() => {
          sound.playClick();
          setScreen('TITLE_MENU');
        }}
        muted={muted}
        onToggleMute={handleToggleMute}
      />
    );
  }

  return (
    <TitleScreen
      selectedHero={selectedHero}
      onSelectHero={(id) => {
        sound.playClick();
        setSelectedHero(id);
      }}
      onStartRpg={() => {
        sound.playClick();
        setScreen('PLAYING_RPG');
      }}
      rpgHighScore={rpgHighScore}
      muted={muted}
      onToggleMute={handleToggleMute}
    />
  );
}
