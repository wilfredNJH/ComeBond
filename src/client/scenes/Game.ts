import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { createLizardAnims } from '../anims/EnemyAnims'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createChestAnims } from '../anims/TreasureAnims'

import Lizard from '../enemies/Lizard'

import '../characters/entity'
import entity from '../characters/entity'

import { sceneEvents } from '../events/EventsCenter'
import Chest from '../items/Chest'
import Server from './services/client_server'
import Bulletin from '../items/Bulletin'
import { createBulletinAnims } from '../anims/BulletinAnims'

import Popup from '../utils/Popup'; // Import the Popup class

export default class Game extends Phaser.Scene
{

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private entity!: entity

	private knives!: Phaser.Physics.Arcade.Group
	private lizards!: Phaser.Physics.Arcade.Group
	private playerLizardsCollider?: Phaser.Physics.Arcade.Collider
    public messageBoxTest: { [key: string]: Phaser.GameObjects.Container } = {};
	public server!: Server;

	private playerName!: string
	private selectedSpriteIndex!: number
	private backgroundMusic?: Phaser.Sound.BaseSound

	
	private bulletinPopup!: Popup; // Add a property for the Popup
	private bulletins!: Phaser.Physics.Arcade.StaticGroup

    private playerPoints: number = 0;

	constructor()
	{
		super('game')
	}

	preload()
    {
		this.cursors = this.input.keyboard.createCursorKeys()
		
    }

    init(data: { playerName: string, selectedSprite: number, server: Server }) {
      this.playerName = data.playerName
      this.selectedSpriteIndex = data.selectedSprite
      this.server = data.server

  }

    async create()
    {
		/***************
		 * SERVER START 
		***************/
		this.server.join() 
		this.messageBoxTest = this.server.messageBox;


    // Add the background music to the scene
    this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true })

    // Start playing the background music
    this.backgroundMusic.play()
		this.scene.run('game-ui')

		createCharacterAnims(this.anims)
		createLizardAnims(this.anims)
		createChestAnims(this.anims)
		createBulletinAnims(this.anims)

		const map = this.make.tilemap({ key: 'dungeon' })
		const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16, 1, 2)
        
		const groundLayer = map.createStaticLayer('Ground', tileset)
		const wallsLayer = map.createStaticLayer('Walls', tileset)

		wallsLayer.setCollisionByProperty({ collides: true })
		map.createStaticLayer('Ground', tileset)

		this.knives = this.physics.add.group({
			classType: Phaser.Physics.Arcade.Image,
			maxSize: 3
		})

      if (this.selectedSpriteIndex == 0) {
        console.log("entity");
        this.entity = this.add.entity(128, 128, 'entity')
      }
      else {
        console.log("LIZARD");

        this.entity = this.add.entity(128, 128, 'lizard')
      }
		this.entity.setKnives(this.knives)

		this.server.passGameScene(this, this.entity)
		this.cameras.main.startFollow(this.entity, true)

		const chests = this.physics.add.staticGroup({
			classType: Chest
		})
		const chestsLayer = map.getObjectLayer('Chests')
		chestsLayer.objects.forEach(chestObj => {
			chests.get(chestObj.x! + chestObj.width! * 0.5, chestObj.y! - chestObj.height! * 0.5, 'treasure')
		})

		this.cameras.main.startFollow(this.entity, true)

		this.lizards = this.physics.add.group({
			classType: Lizard,
			createCallback: (go) => {
				const lizGo = go as Lizard
				lizGo.body.onCollide = true
			}
		})

		const lizardsLayer = map.getObjectLayer('Lizards')
		lizardsLayer.objects.forEach(lizObj => {
			this.lizards.get(lizObj.x! + lizObj.width! * 0.5, lizObj.y! - lizObj.height! * 0.5, 'lizard')
		})

		// Create bulletins
		this.bulletins = this.physics.add.staticGroup({
            classType: Bulletin
        })
        const bulletinsLayer = map.getObjectLayer('Bulletins')
        bulletinsLayer.objects.forEach(bulletinObj => {
           // this.bulletins.get(bulletinObj.x! + bulletinObj.width! * 0.5, bulletinObj.y! - bulletinObj.height! * 0.5, 'bulletin')
		   const bulletin = this.bulletins.get(bulletinObj.x! + bulletinObj.width! * 0.5, bulletinObj.y! - bulletinObj.height! * 0.5, 'bulletin');
		   bulletin.setScale(1);
		 })

		this.physics.add.collider(this.entity, wallsLayer)
		this.physics.add.collider(this.lizards, wallsLayer)

		this.physics.add.collider(this.entity, chests, this.handlePlayerChestCollision, undefined, this)

		this.physics.add.collider(this.knives, wallsLayer, this.handleKnifeWallCollision, undefined, this)
		this.physics.add.collider(this.knives, this.lizards, this.handleKnifeLizardCollision, undefined, this)
		this.physics.add.collider(this.entity, this.bulletins, this.handlePlayerBulletinCollision, undefined, this);

		// this.playerLizardsCollider = this.physics.add.collider(this.lizards, this.entity, this.handlePlayerLizardCollision, undefined, this)
  		this.bulletinPopup = new Popup(this);// Event listener for point changes
		  this.registry.events.on('points-changed', (points) => {
			  console.log(`Points changed: ${points}`);
			  this.playerPoints = points;
			  // Update UI or any other logic based on points
		  });

		
	}

	private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		const chest = obj2 as Chest
		this.entity.setChest(chest)
	}

	private handleKnifeWallCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		this.knives.killAndHide(obj1)
	}

	private handleKnifeLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		this.knives.killAndHide(obj1)
		this.lizards.killAndHide(obj2)
	}

	private handlePlayerLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		const lizard = obj2 as Lizard
		
		const dx = this.entity.x - lizard.x
		const dy = this.entity.y - lizard.y

		const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)

		this.entity.handleDamage(dir)

		sceneEvents.emit('player-health-changed', this.entity.health)

		if (this.entity.health <= 0)
		{
			this.playerLizardsCollider?.destroy()
		}
	}
	private updateMessageBoxPosition(server:Server, playerID: string ) {
			this.messageBoxTest[playerID].setPosition(this.entity.x, this.entity.y - this.entity.height - 20);
		}
	

	private handlePlayerBulletinCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        const bulletin = obj2 as Bulletin
		console.log('Player collided with bulletin'); // Debug statement
    	this.bulletinPopup.showVolunteeringOpportunities();
    }


	private updateOtherMessageBoxPosition(server:Server, playerID: string ) {
		if(this.messageBoxTest[playerID])
			{
				console.log("read here")
		this.messageBoxTest[playerID].setPosition(this.server.otherPlayers[playerID].x, this.server.otherPlayers[playerID].y - this.server.otherPlayers[playerID].height - 20);
		}
	}
	update(t: number, dt: number)
	{
		if (this.entity)
		{
			this.entity.update(this.cursors);
			
			if(this.messageBoxTest[this.server.sessionID]){
				this.updateMessageBoxPosition(this.server,this.server.sessionID);
			}
			
			for (let i = 0; i < this.server.otherPlayerList.length; i++) {
				console.log("testmsg "+this.server.otherPlayerList[i])
				this.updateOtherMessageBoxPosition(this.server,this.server.otherPlayerList[i]);
			}
			// else if(this.messageBoxTest[])
		}
        // Update popup position based on player's position
        this.bulletinPopup.update(this.entity.x, this.entity.y);
		

	}
}
