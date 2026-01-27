import { GameState as GameStateEnum } from "./constants.js";
import {
  handleTitleScreenState,
  handleReadyState,
  handleDeadState,
  handleWonState,
  handleResetState,
  handleRunningState,
  handleGameOverState,
} from "./handlers.js";
import { init } from "./init.js";

let gameState = null;

async function main() {
  const { app, gameState: initializedGameState } = await init();
  gameState = initializedGameState;

  app.ticker.add((ticker) => {
    gameLoop(ticker.deltaTime);
  });

  console.log("Game initialized!");
}

function gameLoop() {
  if (gameState.isPaused) {
    return;
  }

  const currentTime = Date.now();
  gameState.lastFrameTime = currentTime;

  switch (gameState.state) {
    case GameStateEnum.TITLE_SCREEN:
      handleTitleScreenState(gameState, currentTime);
      break;

    case GameStateEnum.READY:
      handleReadyState(gameState, currentTime);
      break;

    case GameStateEnum.DEAD:
      handleDeadState(gameState, currentTime);
      break;

    case GameStateEnum.WON:
      handleWonState(gameState, currentTime);
      break;

    case GameStateEnum.RESET:
      handleResetState(gameState, currentTime);
      break;

    case GameStateEnum.GAME_OVER:
      handleGameOverState(gameState, currentTime);
      break;

    case GameStateEnum.RUNNING:
      handleRunningState(gameState, currentTime);
      break;
  }

  if (gameState.sounds) {
    gameState.sounds.playQueue();
  }
}

main();
