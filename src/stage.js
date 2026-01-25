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

function createBackgroundSprite(app, gameContainer) {
  return PIXI.Assets.load(islandUrl).then((backgroundTexture) => {
    const backgroundSprite = new PIXI.Sprite(backgroundTexture);

    const scaleX = app.screen.width / backgroundTexture.width;
    const scaleY = app.screen.height / backgroundTexture.height;
    const scale = Math.max(scaleX, scaleY);
    backgroundSprite.scale.set(scale);

    backgroundSprite.x = (app.screen.width - backgroundSprite.width) / 2;
    backgroundSprite.y = (app.screen.height - backgroundSprite.height) / 2;

    gameContainer.addChild(backgroundSprite);
    return backgroundSprite;
  });
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
    text: "You won!",
    style: {
      fontFamily: FONT_FAMILY,
      fontSize: MESSAGE_FONT_SIZE,
      fill: COLORS.TEXT,
      align: "center",
    },
  });
  winText.anchor.set(0.5);
  winText.x = app.screen.width / 2;
  winText.y = app.screen.height / 2;
  winText.visible = false;
  uiContainer.addChild(winText);
  return winText;
}

export async function createStageGraphics(app, remainingTime) {
  const gameContainer = new PIXI.Container();
  app.stage.addChild(gameContainer);

  const uiContainer = new PIXI.Container();
  app.stage.addChild(uiContainer);

  const backgroundSprite = await createBackgroundSprite(app, gameContainer);
  const safeCircleDebugGraphics = createSafeCircleDebugGraphics(gameContainer);
  const timerText = createTimerText(uiContainer, remainingTime);
  const deathText = createDeathText(uiContainer, app);
  const winText = createWinText(uiContainer, app);

  return {
    gameContainer,
    uiContainer,
    backgroundSprite,
    timerText,
    deathText,
    winText,
    safeCircleDebugGraphics,
  };
}
