import * as PIXI from "pixi.js";
import { Player } from "./Player.js";
import { Animations } from "./Animations.js";
import { Spritesheet } from "./Spritesheet.js";
import { InputHandler } from "./InputHandler.js";
import spritesheetUrl from "./assets/spritesheet.png?url";
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS } from "./constants.js";
import { loadFont } from "./helper-functions.js";
import { createStageGraphics } from "./stage-graphics.js";
import { hideLoadingScreen } from "./helper-functions.js";
import { GameState } from "./GameState.js";
import { Sounds } from "./Sounds.js";
import readyStateSoundUrl from "./assets/sounds/ready-state.wav?url";
import wonStateSoundUrl from "./assets/sounds/won-state.wav?url";
import gameOverStateSoundUrl from "./assets/sounds/game-over-state.wav?url";
import diedStateSoundUrl from "./assets/sounds/died-state.wav?url";
import hitSoundUrl from "./assets/sounds/hit.wav?url";
import titleScreenSoundUrl from "./assets/sounds/title-screen.wav?url";

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

export async function init() {
  const gameState = new GameState();

  const app = new PIXI.Application();
  await app.init({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,
    canvas: document.getElementById("game-canvas"),
  });

  gameState.app = app;

  app.ticker.maxFPS = 60;

  await loadFont();

  const loadingScreenStartTime = Date.now();

  const inputHandler = new InputHandler();
  gameState.inputHandler = inputHandler;

  const spritesheet = new Spritesheet();
  await spritesheet.load(spritesheetUrl);
  gameState.spritesheet = spritesheet;

  const animations = new Animations(spritesheet);

  const sounds = new Sounds();
  await Promise.all([
    sounds.loadSound("ready-state", readyStateSoundUrl),
    sounds.loadSound("won-state", wonStateSoundUrl),
    sounds.loadSound("game-over-state", gameOverStateSoundUrl),
    sounds.loadSound("died-state", diedStateSoundUrl),
    sounds.loadSound("hit", hitSoundUrl),
    sounds.loadSound("title-screen", titleScreenSoundUrl),
  ]);
  await sounds.waitForAllSounds();
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
    gameState.inputHandler,
    app.screen.width,
    app.screen.height,
    sounds,
    animations,
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

  const loadingScreenElapsed = Date.now() - loadingScreenStartTime;
  const MIN_LOADING_DURATION = 500;
  if (loadingScreenElapsed < MIN_LOADING_DURATION) {
    const remainingTime = MIN_LOADING_DURATION - loadingScreenElapsed;
    await new Promise((resolve) => setTimeout(resolve, remainingTime));
  }

  hideLoadingScreen();

  return { app, gameState };
}
