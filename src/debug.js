import * as PIXI from "pixi.js";
import { COLORS, DRAW_HITBOX } from "./constants.js";

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

