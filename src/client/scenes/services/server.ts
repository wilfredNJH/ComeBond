import Phaser from 'phaser'

import * as Colyseus from "colyseus.js" // not necessary if included via <script> tag. // TODO: remove TEST 


export default class Server extends Phaser.Scene
{
    private client!: Colyseus.Client

    constructor(){
        super('server')
        this.client = new Colyseus.Client('ws://localhost:2567')  // connecting to the server 
        console.log(this.client)
    }

    async join(){

        const room = await this.client.joinOrCreate('my_room')
		console.log(room.name)
        
        // input sending to the server 
        room.onMessage('keydown', (message) => {
			console.log(message)
		})

		this.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
			room.send('keydown', evt.key)
		})


    }

}