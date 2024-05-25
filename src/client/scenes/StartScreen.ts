import Phaser from 'phaser'
import Server from '../scenes/services/server'


export default class StartScreen extends Phaser.Scene {
    private server!: Server
    private playerNameInput?: Phaser.GameObjects.DOMElement
    private spriteSelection?: Phaser.GameObjects.Image[]

    private userPosition?: { latitude: number, longitude: number }
	private streetName?: string
    private streetNameText?: Phaser.GameObjects.Text
    

    constructor() {
        super('start-screen')
    }

    init(data: { server: Server }) {
        this.server = data.server
        this.getUserGeolocation()
    }

    create() {

        // Add the background image
        const background = this.add.image(-17, 0, 'city-bg')
        background.setOrigin(0, 0)
        background.setDisplaySize(this.scale.width, this.scale.height) // Scale the background to fit the game size
        background.setScale(0.5,0.5)

        // Display instructions and input for player name
        this.add.text(100, 100, 'Enter Your Name:', { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff' })

        this.playerNameInput = this.add.dom(300, 130).createFromCache('nameForm')

        // Display sprite selection buttons using frames from atlases
        this.spriteSelection = [
            this.add.image(200, 300, 'entity', 'walk-down-1.png').setInteractive().setDisplaySize(100, 100),
            this.add.image(550, 300, 'lizard', 'idle-1.png').setInteractive().setDisplaySize(70, 125)
        ]

        // Set up click/tap handlers for sprite selection
        this.spriteSelection.forEach(sprite => {
            sprite.on('pointerup', () => {
                // Handle sprite selection (e.g., store selected sprite index)
                const selectedSpriteIndex = this.spriteSelection!.indexOf(sprite)

                // Ensure playerNameInput is defined before accessing node.value
                const playerName = this.playerNameInput?.node instanceof HTMLInputElement
                    ? (this.playerNameInput.node as HTMLInputElement).value
                    : ''

                this.scene.start('game', { playerName, selectedSprite: selectedSpriteIndex, server: this.server })
            })
        })

        // Add text object for street name, initially empty
        this.streetNameText = this.add.text(200, 450, '', { fontFamily: 'Arial', fontSize: '25px', color: '#ffffff' })
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

	getStreetName(latitude: number, longitude: number) {
		const apiKey = process.env.OPENCAGE_API_KEY
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const components = data.results[0].components
                    this.streetName = components.road || components.neighbourhood || 'Unknown location'
                    console.log('Current Location:', this.streetName)
                    this.updateStreetNameText(this.streetName)
                } else {
                    console.error('No results found for the given coordinates.')
                }
            })
            .catch(error => {
                console.error('Error fetching street name:', error)
            })
    }

    updateStreetNameText(streetName: string) {
        if (this.streetNameText) {
            this.streetNameText.setText(`Current Location: ${streetName}`)
        }
    }

}
