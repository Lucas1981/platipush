import {
  GameState as GameStateEnum,
  DEAD_STATE_DURATION,
  INITIAL_TIMER_MS,
} from "./constants.js";
import {
  clearEnemies,
  resetPlayer,
  drawHitbox,
  removeHitbox,
} from "./helper-functions.js";
import { mainLoop } from "./main-loop.js";

export function handleDeadState(gameState, clock) {
  const elapsed = clock.getCurrentTime() - gameState.gameStateStartTime;
  if (elapsed >= DEAD_STATE_DURATION) {
    gameState.state = GameStateEnum.RESET;
    gameState.gameStateStartTime = clock.getCurrentTime();
    if (gameState.deathText) {
      gameState.deathText.visible = false;
    }
  }
}

export function handleWonState(gameState, clock) {
  const elapsed = clock.getCurrentTime() - gameState.gameStateStartTime;
  if (elapsed >= DEAD_STATE_DURATION) {
    gameState.state = GameStateEnum.RESET;
    gameState.gameStateStartTime = clock.getCurrentTime();
    if (gameState.winText) {
      gameState.winText.visible = false;
    }
  }
}

export function handleResetState(gameState, clock) {
  gameState.agents = clearEnemies(gameState.agents);
  resetPlayer(
    gameState.player,
    gameState.playerInitialX,
    gameState.playerInitialY,
  );

  gameState.state = GameStateEnum.RUNNING;
  gameState.gameStateStartTime = clock.getCurrentTime();
  gameState.timerStartTime = clock.getCurrentTime();
  gameState.remainingTime = INITIAL_TIMER_MS;
  gameState.lastEnemySpawnTime = clock.getCurrentTime();
}

export function handleRunningState(gameState, clock, deltaTime) {
  const currentTime = clock.getCurrentTime();
  const result = mainLoop({
    deltaTime,
    currentTime,
    gameState,
    clock,
  });

  for (let i = 0; i < gameState.agents.length; i++) {
    drawHitbox(
      gameState.agents[i],
      gameState.gameContainer,
      gameState.hitboxGraphicsMap,
    );
  }

  for (const [agent] of gameState.hitboxGraphicsMap.entries()) {
    if (!gameState.agents.includes(agent) || !agent.getIsActive()) {
      removeHitbox(agent, gameState.hitboxGraphicsMap);
    }
  }

  if (result.stateChange) {
    gameState.state = result.stateChange.newState;
    gameState.gameStateStartTime = clock.getCurrentTime();

    if (result.stateChange.newState === GameStateEnum.WON) {
      if (gameState.winText) {
        gameState.winText.visible = true;
      }
    } else if (result.stateChange.newState === GameStateEnum.DEAD) {
      if (gameState.deathText) {
        gameState.deathText.visible = true;
      }
    }

    if (result.stateChange.resetTimer) {
      gameState.timerStartTime = clock.getCurrentTime();
      gameState.remainingTime = INITIAL_TIMER_MS;
    }
  }
}
