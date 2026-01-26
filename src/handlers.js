import {
  GameState as GameStateEnum,
  DEAD_STATE_DURATION,
  READY_STATE_DURATION,
  GAME_OVER_STATE_DURATION,
  INITIAL_TIMER_MS,
  INITIAL_LIVES,
} from "./constants.js";
import {
  clearEnemies,
  resetPlayer,
  drawHitbox,
  removeHitbox,
} from "./helper-functions.js";
import { mainLoop } from "./main-loop.js";

function handleEndState(gameState, currentTime, textProperty) {
  const elapsed = currentTime - gameState.gameStateStartTime;
  if (elapsed >= DEAD_STATE_DURATION) {
    if (gameState.lives === 0) {
      gameState.state = GameStateEnum.GAME_OVER;
      if (gameState.gameOverText) {
        gameState.gameOverText.visible = true;
      }
      if (gameState.sounds) {
        gameState.sounds.enqueue("game-over-state");
      }
    } else {
      gameState.state = GameStateEnum.RESET;
    }
    gameState.gameStateStartTime = currentTime;
    const text = gameState[textProperty];
    if (text) {
      text.visible = false;
    }
  }
}

export function handleDeadState(gameState, currentTime) {
  handleEndState(gameState, currentTime, "deathText");
}

export function handleWonState(gameState, currentTime) {
  if (gameState.inputHandler.isKeyPressed("Enter")) {
    resetGameState(gameState, currentTime);
    gameState.state = GameStateEnum.TITLE_SCREEN;
    gameState.gameStateStartTime = currentTime;
    gameState.inputHandler.clearKey("Enter");
    if (gameState.sounds) {
      gameState.sounds.enqueue("title-screen");
    }
    if (gameState.winText) {
      gameState.winText.visible = false;
    }
    if (gameState.gameContainer) {
      gameState.gameContainer.visible = false;
    }
    if (gameState.titleScreenSprite) {
      gameState.titleScreenSprite.visible = true;
    }
  }
}

export function handleTitleScreenState(gameState, currentTime) {
  if (gameState.inputHandler.isKeyPressed("Enter")) {
    resetGameState(gameState, currentTime);
    gameState.state = GameStateEnum.READY;
    gameState.gameStateStartTime = currentTime;
    if (gameState.sounds) {
      gameState.sounds.enqueue("ready-state");
    }
    if (gameState.titleScreenSprite) {
      gameState.titleScreenSprite.visible = false;
    }
    if (gameState.gameContainer) {
      gameState.gameContainer.visible = true;
    }
    if (gameState.readyText) {
      gameState.readyText.text = `Last for 30 seconds\nLives left: ${gameState.lives}\nGood luck!`;
      gameState.readyText.visible = true;
    }
  }
}

export function handleReadyState(gameState, currentTime) {
  const elapsed = currentTime - gameState.gameStateStartTime;
  if (elapsed >= READY_STATE_DURATION) {
    gameState.state = GameStateEnum.RUNNING;
    gameState.gameStateStartTime = currentTime;
    gameState.timerStartTime = currentTime;
    if (gameState.readyText) {
      gameState.readyText.visible = false;
    }
  }
}

function resetGameplayState(gameState, currentTime) {
  gameState.agents = clearEnemies(gameState.agents);
  resetPlayer(
    gameState.player,
    gameState.playerInitialX,
    gameState.playerInitialY,
  );
  if (gameState.player) {
    gameState.player.resetState(currentTime);
  }
  gameState.hitboxGraphicsMap.clear();
}

function resetGameState(gameState, currentTime) {
  resetGameplayState(gameState, currentTime);
  gameState.lives = INITIAL_LIVES;
  gameState.remainingTime = INITIAL_TIMER_MS;
  gameState.timerStartTime = currentTime;
  gameState.lastEnemySpawnTime = currentTime;
}

export function handleGameOverState(gameState, currentTime) {
  const elapsed = currentTime - gameState.gameStateStartTime;
  if (elapsed >= GAME_OVER_STATE_DURATION) {
    resetGameState(gameState, currentTime);
    gameState.state = GameStateEnum.TITLE_SCREEN;
    gameState.gameStateStartTime = currentTime;
    if (gameState.sounds) {
      gameState.sounds.enqueue("title-screen");
    }
    if (gameState.gameOverText) {
      gameState.gameOverText.visible = false;
    }
    if (gameState.gameContainer) {
      gameState.gameContainer.visible = false;
    }
    if (gameState.titleScreenSprite) {
      gameState.titleScreenSprite.visible = true;
    }
    if (gameState.deathText) {
      gameState.deathText.visible = false;
    }
    if (gameState.winText) {
      gameState.winText.visible = false;
    }
    if (gameState.readyText) {
      gameState.readyText.visible = false;
    }
  }
}

export function handleResetState(gameState, currentTime) {
  resetGameplayState(gameState);

  gameState.state = GameStateEnum.READY;
  gameState.gameStateStartTime = currentTime;
  gameState.timerStartTime = currentTime;
  gameState.remainingTime = INITIAL_TIMER_MS;
  gameState.lastEnemySpawnTime = currentTime;
  if (gameState.sounds) {
    gameState.sounds.enqueue("ready-state");
  }
  if (gameState.readyText) {
    gameState.readyText.text = `Last for 30 seconds\nLives left: ${gameState.lives}\nGood luck!`;
    gameState.readyText.visible = true;
  }
}

function updateHitboxes(gameState) {
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
}

export function handleRunningState(gameState, currentTime, deltaTime) {
  const result = mainLoop({
    deltaTime,
    currentTime,
    gameState,
  });

  updateHitboxes(gameState);

  if (result.stateChange) {
    gameState.state = result.stateChange.newState;
    gameState.gameStateStartTime = currentTime;

    if (result.stateChange.newState === GameStateEnum.WON) {
      gameState.winText.visible = true;
      if (gameState.sounds) {
        gameState.sounds.enqueue("won-state");
      }
    } else if (result.stateChange.newState === GameStateEnum.DEAD) {
      gameState.lives -= 1;
      gameState.deathText.visible = true;
      if (gameState.sounds) {
        gameState.sounds.enqueue("died-state");
      }
    }

    if (result.stateChange.resetTimer) {
      gameState.timerStartTime = currentTime;
      gameState.remainingTime = INITIAL_TIMER_MS;
    }
  }
}
