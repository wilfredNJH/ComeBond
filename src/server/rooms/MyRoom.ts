import { Room, Client, Server } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {

  private server!: Server

  onCreate (options: any) {
    this.setState(new MyRoomState());

    // TODO: remove testing, handle keydown 
    this.onMessage("keydown", (client, message) => {
      this.broadcast('keydown', message, {
        except: client
      })
    });

    /***************
    * Player States
    ***************/

    this.onMessage("move", (client, message) => {
      // message is expected to be: { x: number, y: number }
      this.state.movePlayer(client.sessionId, message.x, message.y);
    });

    // Handle player joining
    this.onMessage("join", (client, message) => {
      this.state.addPlayer(client.sessionId, 0, 0); // Add player at position (0, 0)
    });

  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    this.state.addPlayer(client.sessionId, 0, 0); // Add player to the state
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.removePlayer(client.sessionId); // Remove player from the state
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
