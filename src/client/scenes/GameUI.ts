import Phaser from 'phaser'

import { sceneEvents } from '../events/EventsCenter'

export default class GameUI extends Phaser.Scene
{
	private hearts!: Phaser.GameObjects.Group
	private successLabel!: any
	private failureLabel!: any
	private successLabelVisibleTime: number = 0; // Stores the time when the label became visible
	private failureLabelVisibleTime: number = 0; // Stores the time when the label became visible

	constructor()
	{
		super({ key: 'game-ui' })
	}

	create()
	{
		this.add.image(6, 26, 'treasure', 'coin_anim_f0.png')
		const coinsLabel = this.add.text(12, 20, '0', {
			fontSize: '14px'
		})

		this.successLabel = this.add.text(220, 500, '0', {
			fontSize: '40px',
			color: '#00ff00'
		})

		this.failureLabel = this.add.text(220, 500, '0', {
			fontSize: '40px',
			color: '#ff0000'
		})

		this.successLabel.setVisible(false) // default set visible false
		this.failureLabel.setVisible(false) // default set visible false

		sceneEvents.on('player-coins-changed', (coins: number) => {
			coinsLabel.text = coins.toLocaleString()
		})

		sceneEvents.on('success-notification', (message: string) =>{
			this.successLabel.text = message
			this.successLabel.setVisible(true)
			this.successLabelVisibleTime = this.time.now; // Store the current time
		})

		sceneEvents.on('failure-notification', (message: string) =>{
			this.failureLabel.text = message
			this.failureLabel.setVisible(true)
			this.failureLabelVisibleTime = this.time.now; // Store the current time
		})

		this.hearts = this.add.group({
			classType: Phaser.GameObjects.Image
		})

		this.hearts.createMultiple({
			key: 'ui-heart-full',
			setXY: {
				x: 10,
				y: 10,
				stepX: 16
			},
			quantity: 3
		})

		sceneEvents.on('player-health-changed', this.handlePlayerHealthChanged, this)

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			sceneEvents.off('player-health-changed', this.handlePlayerHealthChanged, this)
			sceneEvents.off('player-coins-changed')
		})
	}

	update(time: number, delta: number): void {
        // If the success label is visible, check if 3 seconds have passed
        if (this.successLabel.visible) {
            if (time - this.successLabelVisibleTime > 3000) { // 3000 ms = 3 seconds
                this.successLabel.visible = false; // Hide the label
            }
        }

		if(this.failureLabel.visible){
			if(time - this.failureLabelVisibleTime > 3000){
				this.failureLabel.visible = false;
			}
		}
    }

	private handlePlayerHealthChanged(health: number)
	{
		this.hearts.children.each((go, idx) => {
			const heart = go as Phaser.GameObjects.Image
			if (idx < health)
			{
				heart.setTexture('ui-heart-full')
			}
			else
			{
				heart.setTexture('ui-heart-empty')
			}
		})
	}
}
