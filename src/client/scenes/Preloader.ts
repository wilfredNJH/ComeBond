import Phaser from 'phaser'
import Server from './services/client_server'

export default class Preloader extends Phaser.Scene
{
	// server instance 
	private server!: Server

	constructor()
	{
		super('preloader')
		this.server = new Server()
	}

	preload()
	{
		this.load.image('tiles', 'tiles/dungeon_tiles_extruded.png')
		this.load.tilemapTiledJSON('dungeon', 'tiles/dungeon-01.json')

		this.load.atlas('entity', 'character/fauna.png', 'character/fauna.json')
		this.load.atlas('lizard', 'enemies/lizard.png', 'enemies/lizard.json')
		this.load.atlas('treasure', 'items/treasure.png', 'items/treasure.json')

		this.load.atlas('bulletin', 'items/bulletin.png', 'items/bulletin.json')
		this.load.image('ui-heart-empty', 'ui/ui_heart_empty.png')
		this.load.image('ui-heart-full', 'ui/ui_heart_full.png')
		this.load.image('discussion', 'items/BullentinBoard.png')
		this.load.image('city-bg', 'bg/city-bg.png')
		this.load.image('ground-bg', 'bg/ground-bg.jpg')

		this.load.image('knife', 'weapons/weapon_knife.png')


		// Load your music file here
		this.load.audio('backgroundMusic', 'sounds/background-music.mp3')
	}

	create()
	{
		this.scene.start('start-screen',{
			server: this.server // pass this data object to the other scene 
		})
	}
}