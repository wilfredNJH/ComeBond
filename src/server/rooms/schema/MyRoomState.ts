import { Schema, Context, MapSchema, type } from "@colyseus/schema";

// Define a Player schema
class Player extends Schema {
  @type("string") id: string;
  @type("float32") x: number;
  @type("float32") y: number;

  constructor(id: string, x: number, y: number) {
    super();
    this.id = id;
    this.x = x;
    this.y = y;
  }
}

export class MyRoomState extends Schema {

  @type({ map: Player }) players = new MapSchema<Player>();

  constructor() {
    super();
  }

  // Add a player to the state
  addPlayer(clientId: string, x: number, y: number) {
    this.players.set(clientId, new Player(clientId, x, y));
  }

  // Remove a player from the state
  removePlayer(clientId: string) {
    this.players.delete(clientId);
  }

  // Move a player
  movePlayer(clientId: string, x: number, y: number) {
    const player = this.players.get(clientId);
    if (player) {
      player.x = x;
      player.y = y;
    }
  }
}
