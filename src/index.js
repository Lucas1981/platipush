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
  handleDeadState,
  handleWonState,
  handleResetState,
  handleRunningState,
} from "./handlers.js";
import { GameState } from "./GameState.js";
import { Clock } from "./Clock.js";

let app;
let inputHandler;
let backgroundGraphics = null;

let gameState = null;
let clock = null;

async function main() {
  gameState = new GameState();
  clock = new Clock();

  app = new PIXI.Application();
  await app.init({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,
    canvas: document.getElementById("game-canvas"),
  });

  gameState.app = app;

  app.ticker.maxFPS = 60;

  inputHandler = new InputHandler();

  const spritesheet = new Spritesheet();
  await spritesheet.load(spritesheetUrl);
  gameState.spritesheet = spritesheet;

  await loadFont();

  const stageElements = await createStageGraphics(app, gameState.remainingTime);
  gameState.gameContainer = stageElements.gameContainer;
  backgroundGraphics = stageElements.backgroundSprite;
  gameState.timerText = stageElements.timerText;
  gameState.deathText = stageElements.deathText;
  gameState.winText = stageElements.winText;

  gameState.playerInitialX = app.screen.width / 2;
  gameState.playerInitialY = app.screen.height / 2;

  const player = new Player(
    gameState.playerInitialX,
    gameState.playerInitialY,
    spritesheet,
    inputHandler,
    app.screen.width,
    app.screen.height,
  );

  gameState.player = player;
  gameState.agents.push(player);

  player.draw(gameState.gameContainer);

  gameState.lastEnemySpawnTime = clock.getCurrentTime();
  gameState.state = GameStateEnum.RUNNING;
  gameState.gameStateStartTime = clock.getCurrentTime();
  gameState.timerStartTime = clock.getCurrentTime();
  clock.start();

  app.ticker.add((ticker) => {
    gameLoop(ticker.deltaTime);
  });

  console.log("Game initialized!");
}

function gameLoop(deltaTime) {
  switch (gameState.state) {
    case GameStateEnum.DEAD:
      handleDeadState(gameState, clock);
      break;

    case GameStateEnum.WON:
      handleWonState(gameState, clock);
      break;

    case GameStateEnum.RESET:
      handleResetState(gameState, clock);
      break;

    case GameStateEnum.RUNNING:
      handleRunningState(gameState, clock, deltaTime);
      break;
  }
}

main();
