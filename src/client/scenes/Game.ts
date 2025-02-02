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
import Shop from '../utils/Shop';

export default class Game extends Phaser.Scene
{

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private entity!: entity

	private knives!: Phaser.Physics.Arcade.Group
	private lizards!: Phaser.Physics.Arcade.Group
	private playerLizardsCollider?: Phaser.Physics.Arcade.Collider
    public messageBoxTest: { [key: string]: Phaser.GameObjects.Container } = {};
	public server!: Server;

	private currentNewsTitle?: Phaser.GameObjects.Text

	private playerName!: string
	private selectedSpriteIndex!: number
	private backgroundMusic?: Phaser.Sound.BaseSound

	private userPosition?: { latitude: number, longitude: number }
	private streetName?: string

	
	private bulletinPopup!: Popup; // Add a property for the Popup
	private bulletins!: Phaser.Physics.Arcade.StaticGroup

    private playerPoints: number = 0;
	private bbmessageBox!: Phaser.GameObjects.Container; // Declare the message box property

	private shop!: Shop;


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

	  this.getUserGeolocation()

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
        this.entity = this.add.entity(128, 128, 'entity', false)
      }
      else {
        console.log("LIZARD");

        this.entity = this.add.entity(128, 128, 'entity', true )
      }

	  	this.shop = new Shop(this, this.entity);
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
		// this.physics.add.collider(this.entity, this.bulletins, this.handlePlayerBulletinCollision, undefined, this);

		this.playerLizardsCollider = this.physics.add.collider(this.lizards, this.entity, this.handlePlayerLizardCollision, undefined, this)
  		this.bulletinPopup = new Popup(this);// Event listener for point changes
		  this.registry.events.on('points-changed', (points) => {
			  this.entity._coins += 50;
			  console.log(`coins changed: ${this.entity._coins}`);
			  sceneEvents.emit('player-coins-changed', this.entity._coins)
			  // Update UI or any other logic based on points
		  });

		  //this.currentNewsTitle = this.add.text(50, 50, '', { fontFamily: 'Arial', fontSize: '25px', color: '#ffffff' })
		  this.bbmessageBox = this.createBBMessageBox();
		  // news api 
		  const url = `https://newsapi.org/v2/top-headlines?country=sg&apiKey=727064e1088a4b6db551396a175c6883`;
		  try {
			  const response = await fetch(url);
			  const data = await response.json();
			  if (data.articles && data.articles.length > 0) {
				  console.log('Found articles');
				  console.log(data.articles);
  
				  // Store the article titles
				  const articleTitles = data.articles.map((article: any) => article.title);
  
				  // Display the articles in a rotational manner
				  let currentIndex = 0;
				  const displayArticle = () => {
					  console.log('Current Article Title:', articleTitles[currentIndex]);
					  currentIndex = (currentIndex + 1) % articleTitles.length;
					  setTimeout(displayArticle, 5000); // Rotate every 5 seconds, adjust timing as needed
					  const textObject = this.bbmessageBox.getAt(1) as Phaser.GameObjects.Text; // Assuming the text object is the second element

					  textObject?.setText(`${articleTitles[currentIndex]}`)
				  };
				  displayArticle();
			  } else {
				  console.error('No articles found for the given API.');
			  }
		  } catch (error) {
			  console.error('Error fetching news:', error);
		  }
		
	}

	// private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	// {
	// 	const chest = obj2 as Chest
	// 	this.entity.setChest(chest)
	// }

	private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		this.shop.showShopItems(this.shop.items);
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
        const bulletin = obj2 as Bulletin
		console.log('Player collided with bulletin'); // Debug statement
    	this.bulletinPopup.showVolunteeringOpportunities();
	}
	private updateMessageBoxPosition(server:Server, playerID: string ) {
			this.messageBoxTest[playerID].setPosition(this.entity.x, this.entity.y - this.entity.height - 20);
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
		if (this.bulletinPopup) {
			this.bulletinPopup.update(this.entity.x, this.entity.y);
		}
		if(this.shop){
			this.shop.update(this.entity.x, this.entity.y);
		}
		

	}

	getUserGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                    console.log('User position:', this.userPosition)
                    this.getStreetName(this.userPosition.latitude, this.userPosition.longitude)
                },
                (error) => {
                    console.error('Error getting geolocation:', error)
                }
            )
        } else {
            console.error('Geolocation is not supported by this browser.')
        }
    }
    private createBBMessageBox(): Phaser.GameObjects.Container {
        const boxWidth = 680;
        const boxHeight = 180;
        const boxX = 350;
        const boxY = -90;

		const background = this.add.image(0, 0, 'discussion'); // 'backgroundKey' is the key of your loaded image
		background.setDisplaySize(boxWidth, boxHeight); // Set the size to match the box dimensions
		background.setOrigin(0.5, 0.5);
	

        // // Create a background for the message box
        // const background = this.add.rectangle(0, 0, boxWidth, boxHeight, 0x000000, 0.5);
        // background.setOrigin(0.5, 0.5);

        // Create a text object for the message
        const messageText = this.add.text(0, 0, '', {
            fontSize: '25px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: boxWidth - 200, useAdvancedWrap: true }
        });
        messageText.setOrigin(0.5, 0.5);

        // Create a container to hold the background and text
        const messageBox = this.add.container(boxX, boxY, [background, messageText]);
        messageBox.setVisible(true);

        // Save the message box in the messageBox object
        return messageBox;
    }

	getStreetName(latitude: number, longitude: number) {
		const apiKey = process.env.OPENCAGE_API_KEY
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
		
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const components = data.results[0].components
                    this.streetName = components.road || components.neighbourhood || 'Unknown location'
                    console.log('Location:', this.streetName)
                } else {
                    console.error('No results found for the given coordinates.')
                }
            })
            .catch(error => {
                console.error('Error fetching street name:', error)
            })
    }
}
