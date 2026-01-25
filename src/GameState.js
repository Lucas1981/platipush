import { GameState as GameStateEnum, INITIAL_TIMER_MS } from "./constants.js";

export class GameState {
  constructor() {
    this._state = GameStateEnum.RUNNING;
    this._gameStateStartTime = Date.now();
    this._agents = [];
    this._player = null;
    this._spritesheet = null;
    this._app = null;
    this._gameContainer = null;
    this._timerStartTime = Date.now();
    this._remainingTime = INITIAL_TIMER_MS;
    this._lastEnemySpawnTime = Date.now();
    this._timerText = null;
    this._hitboxGraphicsMap = new Map();
    this._playerInitialX = 0;
    this._playerInitialY = 0;
    this._deathText = null;
    this._winText = null;
  }

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
  }

  get gameStateStartTime() {
    return this._gameStateStartTime;
  }

  set gameStateStartTime(value) {
    this._gameStateStartTime = value;
  }

  get agents() {
    return this._agents;
  }

  set agents(value) {
    this._agents = value;
  }

  get player() {
    return this._player;
  }

  set player(value) {
    this._player = value;
  }

  get spritesheet() {
    return this._spritesheet;
  }

  set spritesheet(value) {
    this._spritesheet = value;
  }

  get app() {
    return this._app;
  }

  set app(value) {
    this._app = value;
  }

  get gameContainer() {
    return this._gameContainer;
  }

  set gameContainer(value) {
    this._gameContainer = value;
  }

  get timerStartTime() {
    return this._timerStartTime;
  }

  set timerStartTime(value) {
    this._timerStartTime = value;
  }

  get remainingTime() {
    return this._remainingTime;
  }

  set remainingTime(value) {
    this._remainingTime = value;
  }

  get lastEnemySpawnTime() {
    return this._lastEnemySpawnTime;
  }

  set lastEnemySpawnTime(value) {
    this._lastEnemySpawnTime = value;
  }

  get timerText() {
    return this._timerText;
  }

  set timerText(value) {
    this._timerText = value;
  }

  get hitboxGraphicsMap() {
    return this._hitboxGraphicsMap;
  }

  get playerInitialX() {
    return this._playerInitialX;
  }

  set playerInitialX(value) {
    this._playerInitialX = value;
  }

  get playerInitialY() {
    return this._playerInitialY;
  }

  set playerInitialY(value) {
    this._playerInitialY = value;
  }

  get deathText() {
    return this._deathText;
  }

  set deathText(value) {
    this._deathText = value;
  }

  get winText() {
    return this._winText;
  }

  set winText(value) {
    this._winText = value;
  }
}
