import * as PIXI from "pixi.js";
import { Player } from "./Player.js";
import { Spritesheet } from "./Spritesheet.js";
import { InputHandler } from "./InputHandler.js";
import spritesheetUrl from "./assets/spritesheet.png?url";
import {
  GameState,
  DEAD_STATE_DURATION,
  INITIAL_TIMER_MS,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  COLORS,
} from "./constants.js";
import {
  clearEnemies,
  resetPlayer,
  loadFont,
  createStageGraphics,
  drawHitbox,
  removeHitbox,
} from "./helper-functions.js";
import { mainLoop } from "./main-loop.js";

let app;
let agents = [];
let spritesheet;
let inputHandler;
let lastEnemySpawnTime = 0;
let gameContainer = null;

let gameState = GameState.RUNNING;
let gameStateStartTime = 0;
let playerInitialX = 0;
let playerInitialY = 0;
let player = null;

let backgroundGraphics = null;
let deathText = null;
let winText = null;
let timerText = null;

let hitboxGraphicsMap = new Map();

let timerStartTime = 0;
let remainingTime = INITIAL_TIMER_MS;

async function main() {
  app = new PIXI.Application();
  await app.init({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,
    canvas: document.getElementById("game-canvas"),
  });

  app.ticker.maxFPS = 60;

  inputHandler = new InputHandler();

  spritesheet = new Spritesheet();
  await spritesheet.load(spritesheetUrl);

  await loadFont();

  const stageElements = await createStageGraphics(app, remainingTime);
  gameContainer = stageElements.gameContainer;
  backgroundGraphics = stageElements.backgroundSprite;
  timerText = stageElements.timerText;
  deathText = stageElements.deathText;
  winText = stageElements.winText;

  playerInitialX = app.screen.width / 2;
  playerInitialY = app.screen.height / 2;

  player = new Player(
    playerInitialX,
    playerInitialY,
    spritesheet,
    inputHandler,
    app.screen.width,
    app.screen.height,
  );

  agents.push(player);

  player.draw(gameContainer);

  lastEnemySpawnTime = Date.now();

  gameState = GameState.RUNNING;
  gameStateStartTime = Date.now();

  resetTimer();

  app.ticker.add((ticker) => {
    gameLoop(ticker.deltaTime);
  });

  console.log("Game initialized!");
}

function resetTimer() {
  timerStartTime = Date.now();
  remainingTime = INITIAL_TIMER_MS;
}

function resetGame() {
  agents = clearEnemies(agents);
  resetPlayer(player, playerInitialX, playerInitialY);
  resetTimer();
  lastEnemySpawnTime = Date.now();
}

function gameLoop(deltaTime) {
  const currentTime = Date.now();

  if (gameState === GameState.DEAD) {
    if (currentTime - gameStateStartTime >= DEAD_STATE_DURATION) {
      gameState = GameState.RESET;
      gameStateStartTime = currentTime;
      deathText.visible = false;
    }
  } else if (gameState === GameState.WON) {
    if (currentTime - gameStateStartTime >= DEAD_STATE_DURATION) {
      gameState = GameState.RESET;
      gameStateStartTime = currentTime;
      winText.visible = false;
    }
  } else if (gameState === GameState.RESET) {
    resetGame();
    gameState = GameState.RUNNING;
    gameStateStartTime = currentTime;
  }

  if (gameState === GameState.RUNNING) {
    const result = mainLoop({
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
    });

    agents = result.agents;
    remainingTime = result.remainingTime;
    lastEnemySpawnTime = result.lastEnemySpawnTime;

    for (let i = 0; i < agents.length; i++) {
      drawHitbox(agents[i], gameContainer, hitboxGraphicsMap);
    }

    for (const [agent, graphics] of hitboxGraphicsMap.entries()) {
      if (!agents.includes(agent) || !agent.getIsActive()) {
        removeHitbox(agent, hitboxGraphicsMap);
      }
    }

    if (result.stateChange) {
      gameState = result.stateChange.newState;
      gameStateStartTime = currentTime;

      if (result.stateChange.newState === GameState.WON) {
        winText.visible = true;
      } else if (result.stateChange.newState === GameState.DEAD) {
        deathText.visible = true;
      }

      if (result.stateChange.resetTimer) {
        resetTimer();
      }
    }
  }
}

main();
