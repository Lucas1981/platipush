import * as PIXI from "pixi.js";
import { Enemy } from "./Enemy.js";
import {
  SAFE_CIRCLE_CENTER_X,
  SAFE_CIRCLE_CENTER_Y,
  SAFE_CIRCLE_RADIUS,
  PLAYER_RADIUS,
  COLORS,
  DRAW_HITBOX,
  FONT_FAMILY,
} from "./constants.js";
import fontUrl from "./assets/PressStart2P-Regular.ttf?url";

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
  for (let i = 0; i < agents.length; i++) {
    if (agents[i] instanceof Enemy) {
      agents[i].destroy();
    }
  }
  return agents.filter((agent) => !(agent instanceof Enemy));
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
