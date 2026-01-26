import { Enemy } from "./Enemy.js";
import {
  GameState as GameStateEnum,
  ENEMY_SPAWN_INTERVAL,
  INITIAL_TIMER_MS,
} from "./constants.js";
import { formatTime, isPlayerInsideSafeCircle } from "./helper-functions.js";

function updateTimer(gameState, currentTime) {
  const timerElapsed = currentTime - gameState.timerStartTime;
  gameState.remainingTime = INITIAL_TIMER_MS - timerElapsed;
  gameState.timerText.text = `Time to last: ${formatTime(gameState.remainingTime)}`;

  if (gameState.remainingTime <= 0) {
    gameState.timerText.text = `Time to last: ${formatTime(0)}`;
    return {
      newState: GameStateEnum.WON,
      resetTimer: true,
    };
  }
  return null;
}

function spawnEnemy(gameState, currentTime) {
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
}

function handleCollisions(gameState) {
  let hasCollision = false;

  for (let i = 0; i < gameState.agents.length; i++) {
    const otherAgent = gameState.agents[i];

    if (otherAgent === gameState.player) {
      continue;
    }

    if (gameState.player.intersects(otherAgent)) {
      if (otherAgent instanceof Enemy) {
        hasCollision = true;
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

  gameState.player.handleHit(hasCollision);
}

function updateAgents(gameState, currentTime) {
  for (let i = 0; i < gameState.agents.length; i++) {
    const agent = gameState.agents[i];
    if (agent === gameState.player) {
      agent.update(currentTime);
    } else {
      agent.update();
    }
  }
}

export function mainLoop({ currentTime, gameState }) {
  let stateChange = updateTimer(gameState, currentTime);

  spawnEnemy(gameState, currentTime);
  updateAgents(gameState, currentTime);
  handleCollisions(gameState);

  if (!isPlayerInsideSafeCircle(gameState.player)) {
    stateChange = {
      newState: GameStateEnum.DEAD,
      resetTimer: true,
    };
  }

  gameState.agents = gameState.agents.filter((agent) => agent.getIsActive());

  return { stateChange };
}
