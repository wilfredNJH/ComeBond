import Phaser from 'phaser'

export default class Bulletin extends Phaser.Physics.Arcade.Sprite
{
	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number)
	{
		super(scene, x, y, texture, frame)

		this.play('bulletin-closed')
	}

	open()
	{
		if (this.anims.currentAnim.key !== 'bulletin-closed')
		{
			return 0
		}

		this.play('bulletin-idle')
		return Phaser.Math.Between(50, 200)
	}
}