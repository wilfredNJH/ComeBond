// CLIENT LOGIC FOR COMMUNICATING TO CLIENT SDK 
import Phaser from 'phaser'

// import { MyRoomState } from '../../../server/rooms/schema/MyRoomState'; // Import your state classes
import * as Colyseus from "colyseus.js" // not necessary if included via <script> tag. // TODO: remove TEST 
import Faune from '~/client/characters/Faune';


export default class Server extends Phaser.Scene
{
    private client!: Colyseus.Client
    // private playerSprites: { [key: string]: Phaser.GameObjects.Sprite } = {};
    private playerSprites: { [key: string]: Faune } = {};
    private gameScene!: Phaser.Scene

    preload() {
    }

    constructor(){
        super('server')
        this.client = new Colyseus.Client('ws://localhost:2567')  // connecting to the server 
        console.log(this.client)


    }

    async join(){

        // const room = await this.client.joinOrCreate('my_room')
		// console.log(room.name)
        
        // // input sending to the server 
        // room.onMessage('keydown', (message) => {
		// 	console.log(message)
		// })

		// this.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
		// 	room.send('keydown', evt.key)
		// })

        this.client.joinOrCreate("my_room").then(room => {
            console.log("joined successfully", room);
            
            // Handle player state updates
            // room.state.players.onAdd = (player, sessionId) => {
            //     console.log('new player has joineeddd!!!!!')
            //     this.addPlayer(sessionId, player);
            //     console.log(`Player ${sessionId} added:`, player);
            // };
            
            // room.state.players.onRemove = (player, sessionId) => {
            //     this.removePlayer(sessionId);
            //     console.log(`Player ${sessionId} removed:`, player);
            // };
            
            // room.state.players.onChange = (player, sessionId) => {
            //     this.updatePlayer(sessionId, player);
            //     console.log(`Player ${sessionId} changed:`, player);
            // };
            
            // Send a join message
            room.send("join");

            // Some other player joined 
            room.onMessage('newplayer', (sessionId) => {
                console.log('new player' + sessionId + 'has joined the room')
                console.log(this.add)
                this.playerSprites[sessionId] = this.gameScene.add.faune(128, 128, 'faune')

            })
            
            // Send a move message
            document.addEventListener("keydown", (event) => {
                const key = event.key;

                // Get current player's position from the game state
                const currentPlayer = room.state.players[room.sessionId];
                // TODO : need to fix this 
                if (currentPlayer) {
                    if (key === "ArrowUp") currentPlayer.y += -1;
                    if (key === "ArrowDown") currentPlayer.y += 1;
                    if (key === "ArrowLeft") currentPlayer.x += -1;
                    if (key === "ArrowRight") currentPlayer.x += 1;
                    
                    let x = currentPlayer.x 
                    let y = currentPlayer.y
                    room.send("move", { x, y });
                }

            });
            }).catch(e => {
            console.log("join error", e);
        });
    }

    passGameScene(pGameScene: any){
        this.gameScene = pGameScene
    }
    
    addPlayer(sessionId: string, player: Player) {
        // Add player sprite
        // const sprite = this.add.faune(128, 128, 'faune'); 
        console.log('added player ' + sessionId + ' ' + player.x + ' ' + player.y)
        // const sprite = this.add.sprite(player.x, player.y, 'knife2');
        // this.playerSprites[sessionId] = sprite;
    }

    // removePlayer(sessionId: string) {
    //     // Remove player sprite
    //     if (this.playerSprites[sessionId]) {
    //         this.playerSprites[sessionId].destroy();
    //         delete this.playerSprites[sessionId];
    //     }
    // }

    // updatePlayer(sessionId: string, player: Player) {
    //     // Update player sprite position
    //     const sprite = this.playerSprites[sessionId];
    //     if (sprite) {
    //         sprite.x = player.x;
    //         sprite.y = player.y;
    //     }
    // }
}