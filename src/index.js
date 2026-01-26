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
import { Sounds } from "./Sounds.js";
import readyStateSoundUrl from "./assets/sounds/ready-state.wav?url";
import wonStateSoundUrl from "./assets/sounds/won-state.wav?url";
import gameOverStateSoundUrl from "./assets/sounds/game-over-state.wav?url";
import diedStateSoundUrl from "./assets/sounds/died-state.wav?url";
import hitSoundUrl from "./assets/sounds/hit.wav?url";
import titleScreenSoundUrl from "./assets/sounds/title-screen.wav?url";

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

  const sounds = new Sounds();
  await sounds.loadSound("ready-state", readyStateSoundUrl);
  await sounds.loadSound("won-state", wonStateSoundUrl);
  await sounds.loadSound("game-over-state", gameOverStateSoundUrl);
  await sounds.loadSound("died-state", diedStateSoundUrl);
  await sounds.loadSound("hit", hitSoundUrl);
  await sounds.loadSound("title-screen", titleScreenSoundUrl);
  gameState.sounds = sounds;

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
    sounds,
  );

  gameState.player = player;
  gameState.agents.push(player);

  player.draw(gameState.gameContainer);

  const currentTime = Date.now();
  gameState.lastEnemySpawnTime = currentTime;
  gameState.gameStateStartTime = currentTime;
  gameState.timerStartTime = currentTime;

  if (gameState.sounds) {
    gameState.sounds.enqueue("title-screen");
  }

  setupVisibilityHandlers(gameState);

  app.ticker.add((ticker) => {
    gameLoop(ticker.deltaTime);
  });

  console.log("Game initialized!");
}

function setupVisibilityHandlers(gameState) {
  const handleVisibilityChange = () => {
    const currentTime = gameState.lastFrameTime || Date.now();
    if (document.hidden) {
      if (!gameState.isPaused) {
        gameState.isPaused = true;
        gameState.pauseStartTime = currentTime;
      }
    } else {
      if (gameState.isPaused) {
        const resumeTime = Date.now();
        const pauseDuration = resumeTime - gameState.pauseStartTime;
        gameState.timerStartTime += pauseDuration;
        gameState.gameStateStartTime += pauseDuration;
        gameState.lastEnemySpawnTime += pauseDuration;
        gameState.isPaused = false;
        gameState.pauseStartTime = 0;
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
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
