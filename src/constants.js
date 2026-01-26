export const GameState = {
  TITLE_SCREEN: "TITLE_SCREEN",
  READY: "READY",
  RUNNING: "RUNNING",
  DEAD: "DEAD",
  RESET: "RESET",
  WON: "WON",
  GAME_OVER: "GAME_OVER",
};

export const ENEMY_SPAWN_INTERVAL = 100;
export const DEAD_STATE_DURATION = 800;
export const READY_STATE_DURATION = 1600;
export const GAME_OVER_STATE_DURATION = 1600;
export const INITIAL_TIMER_MS = 30000;
export const INITIAL_LIVES = 3;

export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 600;

export const SAFE_CIRCLE_RADIUS = 230;
export const SAFE_CIRCLE_CENTER_X = 400;
export const SAFE_CIRCLE_CENTER_Y = 300;

export const COLORS = {
  BACKGROUND: 0x0000ff,
  SAFE_CIRCLE: 0xffd700,
  TEXT: 0xffffff,
  HITBOX: 0x00ff00,
};

export const TEXT_PADDING_X = 20;
export const TEXT_PADDING_Y = 30;
export const TIMER_FONT_SIZE = 16;
export const MESSAGE_FONT_SIZE = 32;

export const PLAYER_RADIUS = 32;
export const SPRITE_SIZE = 64;

export const FONT_FAMILY = "PressStart2P";

export const DRAW_HITBOX = false;
