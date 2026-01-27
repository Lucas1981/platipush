import { Enemy } from "./Enemy.js";
import {
  GameState as GameStateEnum,
  ENEMY_SPAWN_INTERVAL,
  INITIAL_TIMER_MS,
  SAFE_CIRCLE_CENTER_X,
  SAFE_CIRCLE_CENTER_Y,
  SAFE_CIRCLE_RADIUS,
  PLAYER_RADIUS,
} from "./constants.js";
import { formatTime } from "./helper-functions.js";

export function isPlayerInsideSafeCircle(player) {
  if (!player || !player.hitbox) {
    return false;
  }

  const playerCenterX = player.x + player.hitbox.x + player.hitbox.width / 2;
  const playerCenterY = player.y + player.hitbox.y + player.hitbox.height / 2;

  const dx = playerCenterX - SAFE_CIRCLE_CENTER_X;
  const dy = playerCenterY - SAFE_CIRCLE_CENTER_Y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance + PLAYER_RADIUS <= SAFE_CIRCLE_RADIUS;
}

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

function removeInactiveAgents(gameState) {
  for (let i = gameState.agents.length - 1; i >= 0; i--) {
    if (!gameState.agents[i].getIsActive()) {
      gameState.agents.splice(i, 1);
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

  removeInactiveAgents(gameState);

  return { stateChange };
}
