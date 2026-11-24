export type HeroId = 'andrey' | 'celso';

export interface HeroDefinition {
  id: HeroId;
  name: string;
  title: string;
  domain: string;
  description: string;
  portraitUrl: string;
  accentColor: string;
  maxHp: number;
  baseAttack: number;
  defense: number;
  potions: number;
  potionName: string;
  potionHeal: number;
  basicMoveName: string;
  basicMoveDesc: string;
  specialMoveName: string;
  specialMoveDesc: string;
  specialBaseDamage: number;
  dodgeFlavor: string;
  defendFlavor: string;
}

export interface BossMove {
  id: string;
  name: string;
  type: 'attack' | 'charge';
  damage: number;
  description: string;
  codePreview: string;
  phase2Only?: boolean;
}

export const ARENA_BACKDROP_URL = '/src/assets/images/arena_backdrop_1795517555102.jpg';

export const HEROES: Record<HeroId, HeroDefinition> = {
  andrey: {
    id: 'andrey',
    name: 'Andrey',
    title: 'Mestre das Letras e Português',
    domain: 'Gramática, Redação & Sintaxe',
    description:
      'Usa a força da língua portuguesa, ortografia precisa e figuras de linguagem para desestruturar os algoritmos malignos da IA.',
    portraitUrl: '/src/assets/images/hero_andrey_1795517557033.jpg',
    accentColor: '#F59E0B',
    maxHp: 120,
    baseAttack: 24,
    defense: 8,
    potions: 3,
    potionName: 'Café Literário',
    potionHeal: 42,
    basicMoveName: 'Golpe Gramatical',
    basicMoveDesc: 'Lança acentos agudos e verbos certeiros no servidor inimigo.',
    specialMoveName: 'Tempestade Ortográfica',
    specialMoveDesc:
      'Descarrega uma enxurrada de sintaxe perfeita e metáforas devastadoras contra o núcleo da IA.',
    specialBaseDamage: 56,
    dodgeFlavor: 'Andrey aplica uma Elipse Ágil e sai da linha de ataque!',
    defendFlavor: 'Andrey ergue um Escudo de Crase e reduz o impacto!',
  },
  celso: {
    id: 'celso',
    name: 'Celso Escolinha de Futebol',
    title: 'Craque dos Gramados',
    domain: 'Futebol, Tática & Agilidade',
    description:
      'Treinador lendário que transforma chutes colocados, dribles elásticos e trabalho em equipe em pura energia contra o Mega Computador.',
    portraitUrl: '/src/assets/images/hero_celso_1795517557173.jpg',
    accentColor: '#10B981',
    maxHp: 135,
    baseAttack: 22,
    defense: 10,
    potions: 3,
    potionName: 'Isotônico da Escolinha',
    potionHeal: 45,
    basicMoveName: 'Chute Colocado',
    basicMoveDesc: 'Dispara uma bola com efeito direto na placa-mãe do professor.',
    specialMoveName: 'Golaço de Bicicleta',
    specialMoveDesc:
      'Executa uma bicicleta fulminante que atravessa o firewall do Mega Computador!',
    specialBaseDamage: 58,
    dodgeFlavor: 'Celso dá um Drible Elástico e anula completamente o ataque!',
    defendFlavor: 'Celso arma a Barreira da Zaga e amortece o golpe!',
  },
};

export const BOSS_WAGNER = {
  name: 'Prof. Wagner Suantos',
  title: 'Arquiteto do Mega Computador de IA',
  portraitUrl: '/src/assets/images/boss_wagner_1795517556459.jpg',
  maxHp: 260,
  moves: [
    {
      id: 'loop_infinito',
      name: 'Loop Infinito (while true)',
      type: 'attack',
      damage: 24,
      description: 'Prende o campo em um laço sem condição de parada.',
      codePreview: 'while (true) { enviarSobrecarga(); }',
    },
    {
      id: 'ataque_binario',
      name: 'Rajada Binária',
      type: 'attack',
      damage: 28,
      description: 'Dispara pacotes corrompidos de 0s e 1s em alta tensão.',
      codePreview: 'for (let bit = 0; bit < 64; bit++) disparar();',
    },
    {
      id: 'erro_404',
      name: 'Explosão Kernel 404',
      type: 'attack',
      damage: 32,
      description: 'Compila uma falha crítica direcionada ao herói.',
      codePreview: 'throw new Error("DOMINACAO_IA_ATIVADA");',
    },
    {
      id: 'overclock_ia',
      name: 'Protocolo Dominação Global',
      type: 'attack',
      damage: 38,
      description: 'Poder máximo do Mega Computador de IA em modo Overclock.',
      codePreview: 'ia.setControleMundial(100);',
      phase2Only: true,
    },
    {
      id: 'compilar_servidor',
      name: 'Compilando Mega Servidor',
      type: 'charge',
      damage: 0,
      description: 'Wagner Suantos está recalibrando os processadores e não atacará neste turno.',
      codePreview: 'sistema.otimizarCache(); // Sem ataque direto',
    },
    {
      id: 'resfriar_cpu',
      name: 'Resfriamento do Núcleo de IA',
      type: 'charge',
      damage: 0,
      description: 'O Mega Computador precisa dissipar calor antes do próximo ataque.',
      codePreview: 'if (temp > 90) aguardarTurno();',
    },
  ] as BossMove[],
};
