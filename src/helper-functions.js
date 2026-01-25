import * as PIXI from "pixi.js";
import { Enemy } from "./Enemy.js";
import {
  SAFE_CIRCLE_CENTER_X,
  SAFE_CIRCLE_CENTER_Y,
  SAFE_CIRCLE_RADIUS,
  PLAYER_RADIUS,
  COLORS,
  TEXT_PADDING_X,
  TEXT_PADDING_Y,
  TIMER_FONT_SIZE,
  MESSAGE_FONT_SIZE,
  FONT_FAMILY,
  DRAW_HITBOX,
} from "./constants.js";
import islandUrl from "./assets/island.jpeg?url";
import fontUrl from "./assets/PressStart2P-Regular.ttf?url";

let safeCircleDebugGraphics = null;

export function formatTime(ms) {
  const totalMs = Math.max(0, ms);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(milliseconds).padStart(3, "0");

  return `${mm}:${ss}:${mmm}`;
}

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

export function clearEnemies(agents) {
  const updatedAgents = [];
  for (let i = 0; i < agents.length; i++) {
    if (agents[i] instanceof Enemy) {
      agents[i].destroy();
    } else {
      updatedAgents.push(agents[i]);
    }
  }
  return updatedAgents;
}

export function resetPlayer(player, initialX, initialY) {
  if (player) {
    player.x = initialX;
    player.y = initialY;
    player.updateSpritePosition();
  }
}

export async function loadFont() {
  try {
    const font = new FontFace(FONT_FAMILY, `url(${fontUrl})`);
    await font.load();
    document.fonts.add(font);
  } catch (error) {
    console.warn("Could not load font:", error);
  }
}

export async function createStageGraphics(app, remainingTime) {
  const gameContainer = new PIXI.Container();
  app.stage.addChild(gameContainer);

  const uiContainer = new PIXI.Container();
  app.stage.addChild(uiContainer);

  const backgroundTexture = await PIXI.Assets.load(islandUrl);
  const backgroundSprite = new PIXI.Sprite(backgroundTexture);

  const scaleX = app.screen.width / backgroundTexture.width;
  const scaleY = app.screen.height / backgroundTexture.height;
  const scale = Math.max(scaleX, scaleY);
  backgroundSprite.scale.set(scale);

  backgroundSprite.x = (app.screen.width - backgroundSprite.width) / 2;
  backgroundSprite.y = (app.screen.height - backgroundSprite.height) / 2;

  gameContainer.addChild(backgroundSprite);

  if (DRAW_HITBOX) {
    safeCircleDebugGraphics = new PIXI.Graphics();
    safeCircleDebugGraphics.circle(
      SAFE_CIRCLE_CENTER_X,
      SAFE_CIRCLE_CENTER_Y,
      SAFE_CIRCLE_RADIUS,
    );
    safeCircleDebugGraphics.stroke({ color: 0xffff00, width: 2 });
    safeCircleDebugGraphics.fill({ color: 0xffff00, alpha: 0.1 });
    gameContainer.addChild(safeCircleDebugGraphics);
  }

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

export function drawHitbox(agent, gameContainer, hitboxGraphicsMap) {
  if (!DRAW_HITBOX || !agent || !agent.hitbox) {
    return;
  }

  const hitboxX = agent.x + agent.hitbox.x;
  const hitboxY = agent.y + agent.hitbox.y;

  let hitboxGraphics = hitboxGraphicsMap.get(agent);
  if (!hitboxGraphics) {
    hitboxGraphics = new PIXI.Graphics();
    gameContainer.addChild(hitboxGraphics);
    hitboxGraphicsMap.set(agent, hitboxGraphics);
  }

  hitboxGraphics.clear();
  hitboxGraphics.rect(0, 0, agent.hitbox.width, agent.hitbox.height);
  hitboxGraphics.stroke({ color: COLORS.HITBOX, width: 2 });
  hitboxGraphics.fill({ color: COLORS.HITBOX, alpha: 0.3 });

  hitboxGraphics.x = hitboxX;
  hitboxGraphics.y = hitboxY;
}

export function removeHitbox(agent, hitboxGraphicsMap) {
  if (!DRAW_HITBOX) {
    return;
  }

  const hitboxGraphics = hitboxGraphicsMap.get(agent);
  if (hitboxGraphics) {
    hitboxGraphics.destroy();
    hitboxGraphicsMap.delete(agent);
  }
}
