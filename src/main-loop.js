import { Enemy } from "./Enemy.js";
import { GameState as GameStateEnum, ENEMY_SPAWN_INTERVAL, INITIAL_TIMER_MS } from "./constants.js";
import { formatTime, isPlayerInsideSafeCircle } from "./helper-functions.js";

export function mainLoop({ deltaTime, currentTime, gameState, clock }) {
  const timerElapsed = currentTime - gameState.timerStartTime;
  gameState.remainingTime = INITIAL_TIMER_MS - timerElapsed;

  if (gameState.timerText) {
    gameState.timerText.text = `Time to last: ${formatTime(gameState.remainingTime)}`;
  }

  let stateChange = null;

  if (gameState.remainingTime <= 0) {
    stateChange = {
      newState: GameStateEnum.WON,
      resetTimer: true,
    };
    if (gameState.timerText) {
      gameState.timerText.text = `Time to last: ${formatTime(0)}`;
    }
  }

  if (currentTime - gameState.lastEnemySpawnTime >= ENEMY_SPAWN_INTERVAL) {
    const enemy = new Enemy(
      gameState.spritesheet,
      gameState.app.screen.width,
      gameState.app.screen.height,
    );
    gameState.agents.push(enemy);
    enemy.draw(gameState.gameContainer);
    gameState.lastEnemySpawnTime = currentTime;
  }

  for (let i = 0; i < gameState.agents.length; i++) {
    gameState.agents[i].update(deltaTime);
  }

  if (!isPlayerInsideSafeCircle(gameState.player)) {
    stateChange = {
      newState: GameStateEnum.DEAD,
      resetTimer: true,
    };
  }

  if (gameState.player) {
    for (let i = 0; i < gameState.agents.length; i++) {
      const otherAgent = gameState.agents[i];

      if (otherAgent === gameState.player) {
        continue;
      }

      if (gameState.player.intersects(otherAgent)) {
        if (otherAgent instanceof Enemy) {
          const enemyDirection = otherAgent.getDirection();

          const enemyHitboxLeft = otherAgent.x + otherAgent.hitbox.x;
          const enemyHitboxRight = enemyHitboxLeft + otherAgent.hitbox.width;

          if (enemyDirection === -1) {
            gameState.player.x =
              enemyHitboxLeft -
              gameState.player.hitbox.x -
              gameState.player.hitbox.width;
          } else {
            gameState.player.x = enemyHitboxRight - gameState.player.hitbox.x;
          }

          gameState.player.updateSpritePosition();
        }
      }
    }
  }

  gameState.agents = gameState.agents.filter((agent) => agent.getIsActive());

  return { stateChange };
}
