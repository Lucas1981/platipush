import { Enemy } from "./Enemy.js";
import {
  GameState,
  ENEMY_SPAWN_INTERVAL,
  INITIAL_TIMER_MS,
} from "./constants.js";
import { formatTime, isPlayerInsideSafeCircle } from "./helper-functions.js";

export function mainLoop({
  deltaTime,
  currentTime,
  agents,
  player,
  spritesheet,
  app,
  gameContainer,
  timerStartTime,
  remainingTime,
  lastEnemySpawnTime,
  timerText,
}) {
  let updatedAgents = [...agents];
  let updatedRemainingTime = remainingTime;
  let updatedLastEnemySpawnTime = lastEnemySpawnTime;
  let stateChange = null;

  const elapsed = currentTime - timerStartTime;
  updatedRemainingTime = INITIAL_TIMER_MS - elapsed;

  if (timerText) {
    timerText.text = `Time to last: ${formatTime(updatedRemainingTime)}`;
  }

  if (updatedRemainingTime <= 0) {
    stateChange = {
      newState: GameState.WON,
      resetTimer: true,
    };
    if (timerText) {
      timerText.text = `Time to last: ${formatTime(0)}`;
    }
  }

  if (currentTime - updatedLastEnemySpawnTime >= ENEMY_SPAWN_INTERVAL) {
    const enemy = new Enemy(spritesheet, app.screen.width, app.screen.height);
    updatedAgents.push(enemy);
    enemy.draw(gameContainer);
    updatedLastEnemySpawnTime = currentTime;
  }

  for (let i = 0; i < updatedAgents.length; i++) {
    updatedAgents[i].update(deltaTime);
  }

  if (!isPlayerInsideSafeCircle(player)) {
    stateChange = {
      newState: GameState.DEAD,
      resetTimer: true,
    };
  }

  if (player) {
    for (let i = 0; i < updatedAgents.length; i++) {
      const otherAgent = updatedAgents[i];

      if (otherAgent === player) {
        continue;
      }

      if (player.intersects(otherAgent)) {
        if (otherAgent instanceof Enemy) {
          const enemyDirection = otherAgent.getDirection();

          const enemyHitboxLeft = otherAgent.x + otherAgent.hitbox.x;
          const enemyHitboxRight = enemyHitboxLeft + otherAgent.hitbox.width;

          const playerHitboxLeft = player.x + player.hitbox.x;
          const playerHitboxRight = playerHitboxLeft + player.hitbox.width;

          if (enemyDirection === -1) {
            player.x = enemyHitboxLeft - player.hitbox.x - player.hitbox.width;
          } else {
            player.x = enemyHitboxRight - player.hitbox.x;
          }

          player.updateSpritePosition();
        }
      }
    }
  }

  updatedAgents = updatedAgents.filter((agent) => agent.getIsActive());

  return {
    agents: updatedAgents,
    remainingTime: updatedRemainingTime,
    lastEnemySpawnTime: updatedLastEnemySpawnTime,
    stateChange,
  };
}
