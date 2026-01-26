import * as PIXI from "pixi.js";
import { Player } from "./Player.js";
import { Spritesheet } from "./Spritesheet.js";
import { InputHandler } from "./InputHandler.js";
import spritesheetUrl from "./assets/spritesheet.png?url";
import {
  GameState as GameStateEnum,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  COLORS,
} from "./constants.js";
import { loadFont } from "./helper-functions.js";
import { createStageGraphics } from "./stage-graphics.js";
import {
  handleTitleScreenState,
  handleReadyState,
  handleDeadState,
  handleWonState,
  handleResetState,
  handleRunningState,
  handleGameOverState,
} from "./handlers.js";
import { GameState } from "./GameState.js";

let app;
let gameState = null;

async function main() {
  gameState = new GameState();

  app = new PIXI.Application();
  await app.init({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,
    canvas: document.getElementById("game-canvas"),
  });

  gameState.app = app;

  app.ticker.maxFPS = 60;

  const inputHandler = new InputHandler();
  gameState.inputHandler = inputHandler;

  const spritesheet = new Spritesheet();
  await spritesheet.load(spritesheetUrl);
  gameState.spritesheet = spritesheet;

  await loadFont();

  const stageElements = await createStageGraphics(
    app,
    gameState.remainingTime,
    gameState.lives,
  );
  gameState.gameContainer = stageElements.gameContainer;
  gameState.timerText = stageElements.timerText;
  gameState.deathText = stageElements.deathText;
  gameState.winText = stageElements.winText;
  gameState.titleScreenSprite = stageElements.titleScreenSprite;
  gameState.readyText = stageElements.readyText;
  gameState.gameOverText = stageElements.gameOverText;

  gameState.gameContainer.visible = false;

  gameState.playerInitialX = app.screen.width / 2;
  gameState.playerInitialY = app.screen.height / 2;

  const player = new Player(
    gameState.playerInitialX,
    gameState.playerInitialY,
    spritesheet,
    gameState.inputHandler,
    app.screen.width,
    app.screen.height,
  );

  gameState.player = player;
  gameState.agents.push(player);

  player.draw(gameState.gameContainer);

  const currentTime = Date.now();
  gameState.lastEnemySpawnTime = currentTime;
  gameState.gameStateStartTime = currentTime;
  gameState.timerStartTime = currentTime;

  app.ticker.add((ticker) => {
    gameLoop(ticker.deltaTime);
  });

  console.log("Game initialized!");
}

function gameLoop(deltaTime) {
  const currentTime = Date.now();

  switch (gameState.state) {
    case GameStateEnum.TITLE_SCREEN:
      handleTitleScreenState(gameState);
      break;

    case GameStateEnum.READY:
      handleReadyState(gameState, currentTime);
      break;

    case GameStateEnum.DEAD:
      handleDeadState(gameState, currentTime);
      break;

    case GameStateEnum.WON:
      handleWonState(gameState);
      break;

    case GameStateEnum.RESET:
      handleResetState(gameState, currentTime);
      break;

    case GameStateEnum.GAME_OVER:
      handleGameOverState(gameState, currentTime);
      break;

    case GameStateEnum.RUNNING:
      handleRunningState(gameState, currentTime, deltaTime);
      break;
  }
}

main();
