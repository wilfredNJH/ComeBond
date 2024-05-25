import Phaser from 'phaser'

const createBulletinAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'bulletin-idle',
		frames: anims.generateFrameNames('bulletin', { start: 0, end: 2, prefix: 'bulletin_empty_open_anim_f', suffix: '.png' }),
		frameRate: 5
    })

    anims.create({
        key: 'bulletin-closed',
        frames: [{ key: 'bulletin', frame: 'bulletin_empty_open_anim_f0.png' }]
    })
}

export {
    createBulletinAnims
}


