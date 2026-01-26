import * as PIXI from "pixi.js";
import {
  SAFE_CIRCLE_CENTER_X,
  SAFE_CIRCLE_CENTER_Y,
  SAFE_CIRCLE_RADIUS,
  COLORS,
  TEXT_PADDING_X,
  TEXT_PADDING_Y,
  TIMER_FONT_SIZE,
  MESSAGE_FONT_SIZE,
  FONT_FAMILY,
  DRAW_HITBOX,
} from "./constants.js";
import { formatTime } from "./helper-functions.js";
import islandUrl from "./assets/island.jpeg?url";
import titleScreenUrl from "./assets/title-screen.png?url";

async function createBackgroundSprite(app, gameContainer) {
  const backgroundTexture = await PIXI.Assets.load(islandUrl);
  const backgroundSprite = new PIXI.Sprite(backgroundTexture);

  const scaleX = app.screen.width / backgroundTexture.width;
  const scaleY = app.screen.height / backgroundTexture.height;
  const scale = Math.max(scaleX, scaleY);
  backgroundSprite.scale.set(scale);

  backgroundSprite.x = (app.screen.width - backgroundSprite.width) / 2;
  backgroundSprite.y = (app.screen.height - backgroundSprite.height) / 2;

  gameContainer.addChild(backgroundSprite);
  return backgroundSprite;
}

function createSafeCircleDebugGraphics(gameContainer) {
  if (!DRAW_HITBOX) {
    return null;
  }

  const safeCircleDebugGraphics = new PIXI.Graphics();
  safeCircleDebugGraphics.circle(
    SAFE_CIRCLE_CENTER_X,
    SAFE_CIRCLE_CENTER_Y,
    SAFE_CIRCLE_RADIUS,
  );
  safeCircleDebugGraphics.stroke({ color: 0xffff00, width: 2 });
  safeCircleDebugGraphics.fill({ color: 0xffff00, alpha: 0.1 });
  gameContainer.addChild(safeCircleDebugGraphics);
  return safeCircleDebugGraphics;
}

function createTimerText(uiContainer, remainingTime) {
  const timerText = new PIXI.Text({
    text: `Time to last: ${formatTime(remainingTime)}`,
    style: {
      fontFamily: FONT_FAMILY,
      fontSize: TIMER_FONT_SIZE,
      fill: COLORS.TEXT,
    },
  });
  timerText.x = TEXT_PADDING_X;
  timerText.y = TEXT_PADDING_Y;
  uiContainer.addChild(timerText);
  return timerText;
}

function createDeathText(uiContainer, app) {
  const deathText = new PIXI.Text({
    text: "You died",
    style: {
      fontFamily: FONT_FAMILY,
      fontSize: MESSAGE_FONT_SIZE,
      fill: COLORS.TEXT,
      align: "center",
    },
  });
  deathText.anchor.set(0.5);
  deathText.x = app.screen.width / 2;
  deathText.y = app.screen.height / 2;
  deathText.visible = false;
  uiContainer.addChild(deathText);
  return deathText;
}

function createWinText(uiContainer, app) {
  const winText = new PIXI.Text({
    text: "You won!\nPush enter to return",
    style: {
      fontFamily: FONT_FAMILY,
      fontSize: MESSAGE_FONT_SIZE,
      fill: COLORS.TEXT,
      align: "center",
      lineHeight: MESSAGE_FONT_SIZE * 1.5,
    },
  });
  winText.anchor.set(0.5);
  winText.x = app.screen.width / 2;
  winText.y = app.screen.height / 2;
  winText.visible = false;
  uiContainer.addChild(winText);
  return winText;
}

function createGameOverText(uiContainer, app) {
  const gameOverText = new PIXI.Text({
    text: "Game Over",
    style: {
      fontFamily: FONT_FAMILY,
      fontSize: MESSAGE_FONT_SIZE,
      fill: COLORS.TEXT,
      align: "center",
    },
  });
  gameOverText.anchor.set(0.5);
  gameOverText.x = app.screen.width / 2;
  gameOverText.y = app.screen.height / 2;
  gameOverText.visible = false;
  uiContainer.addChild(gameOverText);
  return gameOverText;
}

function createReadyText(uiContainer, app, lives) {
  const readyText = new PIXI.Text({
    text: `Last for 30 seconds\nLives left: ${lives}\nGood luck!`,
    style: {
      fontFamily: FONT_FAMILY,
      fontSize: MESSAGE_FONT_SIZE,
      fill: COLORS.TEXT,
      align: "center",
      lineHeight: MESSAGE_FONT_SIZE * 1.5,
    },
  });
  readyText.anchor.set(0.5);
  readyText.x = app.screen.width / 2;
  readyText.y = app.screen.height / 2;
  readyText.visible = false;
  uiContainer.addChild(readyText);
  return readyText;
}

async function createTitleScreenSprite(app, uiContainer) {
  const titleTexture = await PIXI.Assets.load(titleScreenUrl);
  const titleSprite = new PIXI.Sprite(titleTexture);

  const scaleX = app.screen.width / titleTexture.width;
  const scaleY = app.screen.height / titleTexture.height;
  const scale = Math.max(scaleX, scaleY);
  titleSprite.scale.set(scale);

  titleSprite.x = (app.screen.width - titleSprite.width) / 2;
  titleSprite.y = (app.screen.height - titleSprite.height) / 2;

  uiContainer.addChild(titleSprite);
  return titleSprite;
}

export async function createStageGraphics(app, remainingTime, lives) {
  const gameContainer = new PIXI.Container();
  app.stage.addChild(gameContainer);

  const uiContainer = new PIXI.Container();
  app.stage.addChild(uiContainer);

  const backgroundSprite = await createBackgroundSprite(app, gameContainer);
  const safeCircleDebugGraphics = createSafeCircleDebugGraphics(gameContainer);
  const timerText = createTimerText(uiContainer, remainingTime);
  const deathText = createDeathText(uiContainer, app);
  const winText = createWinText(uiContainer, app);
  const titleScreenSprite = await createTitleScreenSprite(app, uiContainer);
  const readyText = createReadyText(uiContainer, app, lives);
  const gameOverText = createGameOverText(uiContainer, app);

  return {
    gameContainer,
    uiContainer,
    backgroundSprite,
    timerText,
    deathText,
    winText,
    safeCircleDebugGraphics,
    titleScreenSprite,
    readyText,
    gameOverText,
  };
}
