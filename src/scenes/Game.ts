import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { createLizardAnims } from '../anims/EnemyAnims'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createChestAnims } from '../anims/TreasureAnims'

import Lizard from '../enemies/Lizard'

import '../characters/Faune'
import Faune from '../characters/Faune'

import { sceneEvents } from '../events/EventsCenter'
import Chest from '../items/Chest'
import Bulletin from '../items/Bulletin'
import { createBulletinAnims } from '../anims/BulletinAnims'

import Popup from '../utils/Popup'; // Import the Popup class

export default class Game extends Phaser.Scene
{
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Faune

	private knives!: Phaser.Physics.Arcade.Group
	private lizards!: Phaser.Physics.Arcade.Group
	private playerLizardsCollider?: Phaser.Physics.Arcade.Collider
	
	private bulletinPopup!: Popup; // Add a property for the Popup
	private bulletins!: Phaser.Physics.Arcade.StaticGroup

	constructor()
	{
		super('game')
	}

	preload()
    {
		this.cursors = this.input.keyboard.createCursorKeys()
		
    }

    create()
    {
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


		this.knives = this.physics.add.group({
			classType: Phaser.Physics.Arcade.Image,
			maxSize: 3
		})

		this.faune = this.add.faune(128, 128, 'faune')
		this.faune.setKnives(this.knives)

		this.cameras.main.startFollow(this.faune, true)

		const chests = this.physics.add.staticGroup({
			classType: Chest
		})
		const chestsLayer = map.getObjectLayer('Chests')
		chestsLayer.objects.forEach(chestObj => {
			chests.get(chestObj.x! + chestObj.width! * 0.5, chestObj.y! - chestObj.height! * 0.5, 'treasure')
		})

		this.cameras.main.startFollow(this.faune, true)

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
            this.bulletins.get(bulletinObj.x! + bulletinObj.width! * 0.5, bulletinObj.y! - bulletinObj.height! * 0.5, 'bulletin')
        })

		this.physics.add.collider(this.faune, wallsLayer)
		this.physics.add.collider(this.lizards, wallsLayer)

		this.physics.add.collider(this.faune, chests, this.handlePlayerChestCollision, undefined, this)

		this.physics.add.collider(this.knives, wallsLayer, this.handleKnifeWallCollision, undefined, this)
		this.physics.add.collider(this.knives, this.lizards, this.handleKnifeLizardCollision, undefined, this)
		this.physics.add.collider(this.faune, this.bulletins, this.handlePlayerBulletinCollision, undefined, this);

		this.playerLizardsCollider = this.physics.add.collider(this.lizards, this.faune, this.handlePlayerLizardCollision, undefined, this)
		this.bulletinPopup = new Popup(this);
      

		
	}

	private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		const chest = obj2 as Chest
		this.faune.setChest(chest)
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
		
		const dx = this.faune.x - lizard.x
		const dy = this.faune.y - lizard.y

		const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)

		this.faune.handleDamage(dir)

		sceneEvents.emit('player-health-changed', this.faune.health)

		if (this.faune.health <= 0)
		{
			this.playerLizardsCollider?.destroy()
		}
	}

	private handlePlayerBulletinCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        const bulletin = obj2 as Bulletin
		console.log('Player collided with bulletin'); // Debug statement
    	this.bulletinPopup.showVolunteeringOpportunities();
    }
	
	update(t: number, dt: number)
	{
		if (this.faune)
		{
			this.faune.update(this.cursors)
		}


	}
}
