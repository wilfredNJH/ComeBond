import Phaser from 'phaser'
import Server from '../scenes/services/server'


export default class StartScreen extends Phaser.Scene {
    private server!: Server
    private playerNameInput?: Phaser.GameObjects.DOMElement
    private spriteSelection?: Phaser.GameObjects.Image[]

    constructor() {
        super('start-screen')
    }

    init(data: { server: Server }) {
        this.server = data.server
    }

    create() {
        // Display instructions and input for player name
        this.add.text(100, 100, 'Enter Your Name:', { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff' })

        this.playerNameInput = this.add.dom(300, 130).createFromCache('nameForm')

        // Display sprite selection buttons using frames from atlases
        this.spriteSelection = [
            this.add.image(200, 300, 'faune', 'walk-down-1.png').setInteractive(),
            this.add.image(400, 300, 'lizard', 'idle-1.png').setInteractive()
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
    }
}