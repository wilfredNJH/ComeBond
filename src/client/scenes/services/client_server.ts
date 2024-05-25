// CLIENT LOGIC FOR COMMUNICATING TO CLIENT SDK 
import Phaser from 'phaser'

// import { MyRoomState } from '../../../server/rooms/schema/MyRoomState'; // Import your state classes
import * as Colyseus from "colyseus.js" // not necessary if included via <script> tag. // TODO: remove TEST 
import entity from '~/client/characters/entity';
import { Room } from 'colyseus';


export default class Server extends Phaser.Scene
{
    private client!: Colyseus.Client
    private mRoom!: any
    private otherPlayers: { [key: string]: entity } = {};
    private gameScene!: Phaser.Scene
    private playerentity!: entity

    private chatInput!: HTMLInputElement;
    private isChatting: boolean = false;
    public messageBox: { [key: string]: Phaser.GameObjects.Container } = {};
    public sessionID !: string ;
    public movement: number = 0;
    public otherPlayerList: string[] = [];


    preload() {
    }

    constructor(){
        super('server')
        this.client = new Colyseus.Client('ws://localhost:2567')  // connecting to the server 
        console.log(this.client)


    }

    async join(){

        // // input sending to the server 
        // room.onMessage('keydown', (message) => {
		// 	console.log(message)
		// })

		// this.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
		// 	room.send('keydown', evt.key)
		// })

        this.client.joinOrCreate("my_room").then(room => {
            console.log("joined successfully", room);

            this.mRoom = room
            this.sessionID = this.mRoom.sessionId;
            // Handle player state updates
            this.mRoom.state.players.onAdd = (player, sessionId) => {
                this.addPlayer(sessionId, player.x, player.y);
                if(sessionId != this.mRoom.sessionId)
                    {
                        this.otherPlayerList.push(sessionId);

                    }
                console.log(player.healthState)
                console.log("add");
                this.createMessageBox(sessionId,player);
            };
            
            // room.state.players.onRemove = (player, sessionId) => {
            //     this.removePlayer(sessionId);
            //     console.log(`Player ${sessionId} removed:`, player);
            // };
            
            // room.state.players.onChange = (player, sessionId) => {
            //     this.updatePlayer(sessionId, player);
            //     console.log(`TEST TEST Player ${sessionId} changed:`, player);
            // };
            
            // Send a join message
            this.mRoom.send("join");

            room.onMessage('chat', (message) => {
                console.log(`Chat from ${message.clientId}: ${message.message}`);
                this.showMessage(message.message,message.clientId);
            });
        
            this.gameScene.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
                if (evt.key === 'Enter') {
                    if (this.isChatting && this.chatInput.value.trim() !== '') {
                        room.send('chat', this.chatInput.value.trim());
                        this.chatInput.value = ''; // Clear input after sending
                        this.chatInput.style.display = 'none'; // Hide input after sending
                        this.isChatting = false;
                    } else {
                        this.chatInput.style.display = 'block'; // Show input for typing
                        this.chatInput.focus();
                        this.isChatting = true;
                    }
                } else if (!this.isChatting) {
                    room.send('keydown', evt.key);
                }
            });
    

            // Some other player moved 
            this.mRoom.onMessage('*', (type, message) => {
                if (type === 'othermove') {
                    console.log('ENTERED HERE')
                    // Do something with the received data
                    const { sessionId, x, y, currKey } = message;
                    console.log("ck "+currKey)
                    console.log("Received othermove message from session ID " + sessionId + " with position x: " + x + ", y: " + y);
                    // const prevPosX = this.otherPlayers[sessionId].x
                    // const prevPosY = this.otherPlayers[sessionId].y
                    if (currKey === "ArrowUp") 
                    {
                        this.movement = 3;
                    } 
                    else if (currKey === "ArrowDown") 
                    {
                        this.movement = 4;
                    } 
                    else if (currKey === "ArrowLeft") 
                    {
                        this.movement = 1;
                    }
                        else if (currKey === "ArrowRight") 
                    {
                        this.movement = 2;
                    } 
                        // if(prevPosX != x){
                    //     const dir = x - prevPosX;
                    //     console.log("dirx" +dir)
                    //     if(dir > 0){
                    //         this.movement = 2;
                    //     }
                    //     else if(dir<0){
                    //         this.movement = 1;
                    //     }
                    //     else{
                    //         this.movement = 5;
                    //     }
                    // }
                    // if(prevPosY != y){
                    //     const dir = y - prevPosY;
                    //     console.log("dirx" +dir)

                    //     if(dir > 0){
                    //         this.movement = 4;
                    //     }
                    //     else if(dir < 0){
                    //         this.movement = 3;
                    //     }
                    //     else{
                    //         this.movement = 5
                    //     }
                    // }
                    // update the corresponding player's position 
                    //this.otherPlayers[sessionId].set_body_position(x, y)

                    if(this.otherPlayers[sessionId]){
                    this.otherPlayers[sessionId].alt_update(this.movement) // TODO: change this
                     }
                }
            });
              

            this.mRoom.onMessage('keyup_event', (message) => {
                console.log("keyup event from server")
                const { sessionId, x, y } = message;
                if(this.otherPlayers[sessionId]){
                    this.movement = 5
                    this.otherPlayers[sessionId].alt_update(this.movement) // TODO: change this
                    console.log("clienteventup "+x,y)

                    // this.otherPlayers[sessionId].body.x = x
                    // this.otherPlayers[sessionId].body.y = y

                    this.otherPlayers[sessionId].setPosition(x, y)
                }

            });
              

              
            
            this.createChatInput();


            // Send a move message
            document.addEventListener("keydown", (event) => {
                const key = event.key;

                // Get current player's position from the game state
                const currentPlayer = this.mRoom.state.players[this.mRoom.sessionId];
                // TODO : need to fix this 
                if (currentPlayer) {
                    var currKey;
                    // TODO : fix this
                    if (key === "ArrowUp") 
                    {
                        currKey = "ArrowUp";
                    } 
                    else if (key === "ArrowDown") 
                    {
                        currKey = "ArrowDown";
                    } 
                    else if (key === "ArrowLeft") 
                    {
                        currKey = "ArrowLeft";
                    }
                     else if (key === "ArrowRight") 
                    {
                        currKey = "ArrowRight";
                    } 
                    let x = this.playerentity.x
                    let y = this.playerentity.y
                    console.log('x ', x , 'y ', y)
                    this.mRoom.send("move", { x , y , currKey} );
                }

            });


            // document.addEventListener("keydown", (event) => {
            //     const key = event.key;
            
            //     // Get current player's position from the game state
            //     const currentPlayer = this.mRoom.state.players[this.mRoom.sessionId];
                
            //     if (currentPlayer) {
            //         let x = this.playerFaune.x;
            //         let y = this.playerFaune.y;
            
            //         // Check which arrow key was pressed and update the position
            //         if (key === "ArrowUp") {
            //             y -= 1;
            //         } else if (key === "ArrowDown") {
            //             y += 1;
            //         } else if (key === "ArrowLeft") {
            //             x -= 1;
            //         } else if (key === "ArrowRight") {
            //             x += 1;
            //         }
            
            //         console.log('x ', x, 'y ', y);
            //         this.mRoom.send("move", { x, y });
            //     }
            // });
            



            document.addEventListener("keyup", (event) => {
                const key = event.key;

                // Get current player's position from the game state
                //const currentPlayer = this.mRoom.state.players[this.mRoom.sessionId];
                // TODO : need to fix this 
               // if (currentPlayer) {
                let x = this.playerentity.x 
                let y = this.playerentity.y
                console.log("stopmove " +x,y)
                this.mRoom.send("stop_move",{x,y});
        

            });


            }).catch(e => {
            console.log("join error", e);
        });
    }

    passGameScene(pGameScene: any, pPlayerentity: any){
        this.gameScene = pGameScene
        this.playerentity = pPlayerentity
    }

    addPlayer(sessionId: string, posX: number, posY: number) {
        if(this.mRoom.sessionId != sessionId){
            console.log('CREATED OTHER PLAYER' + sessionId + 'current ID' + this.mRoom.sessionId)
            this.otherPlayers[sessionId] = this.gameScene.add.entity(posX, posY, 'entity')

        }
    }

    removePlayer(sessionId: string) {
        // Remove player sprite
        if (this.otherPlayers[sessionId]) {
            this.otherPlayers[sessionId].destroy();
            delete this.otherPlayers[sessionId];
        }
    }
     createChatInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type your message...';
        input.style.position = 'absolute';
        input.style.bottom = '10px';
        input.style.left = '10px';
        input.style.display = 'none'; // Initially hidden
        document.body.appendChild(input);
        this.chatInput = input;
    }
    createMessageBox(playerId: string, player: entity): Phaser.GameObjects.Container {
        console.log(playerId);
        const boxWidth = 40;
        const boxHeight = 30;
        const boxX = player.x;
        const boxY = player.y - player.height;

        // Create a background for the message box
        const background = this.gameScene.add.rectangle(0, 0, boxWidth, boxHeight, 0x000000, 0.5);
        background.setOrigin(0.5, 0.5);

        // Create a text object for the message
        const messageText = this.gameScene.add.text(0, 0, '', {
            fontSize: '11px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: boxWidth - 10, useAdvancedWrap: true }
        });
        messageText.setOrigin(0.5, 0.5);

        // Create a container to hold the background and text
        const messageBox = this.gameScene.add.container(boxX, boxY, [background, messageText]);
        messageBox.setVisible(false);

        // Save the message box in the messageBox object
        this.messageBox[playerId] = messageBox;
        console.log("created for " + playerId);
        return messageBox;
    }
    
    showMessage(message: string, playerID: string) {
        console.log("showed" + playerID);
        console.log("t"+this.mRoom.sessionId);
        const msgBox = this.messageBox[playerID];

        if(this.mRoom.sessionId == playerID){
            const currPlayer = this.mRoom.state.players[playerID];
            console.log("a",currPlayer.x)
            msgBox.setPosition(currPlayer.x, currPlayer.y - 10 - 20);

        }
        else{
            const currPlayer = this.otherPlayers[playerID];
            msgBox.setPosition(currPlayer.x, currPlayer.y - 10 - 20);

        }
        if (msgBox) {
            const textObject = msgBox.getAt(1) as Phaser.GameObjects.Text; // Assuming the text object is the second element
            textObject.setText(message);
            msgBox.setVisible(true);
            this.gameScene.time.delayedCall(3000, () => {
                msgBox.setVisible(false);
            }, [], this);
        }
    }

    updatePlayers(){
        // loop through all the players and update the position 
        this.otherPlayers[this.sessionID]
    }
    
    // updatePlayer(sessionId: string, player: Player) {
    //     // Update player sprite position
    //     const sprite = this.otherPlayers[sessionId];
    //     if (sprite) {
    //         sprite.x = player.x;
    //         sprite.y = player.y;
    //     }
    // }
}