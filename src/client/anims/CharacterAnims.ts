import Phaser from 'phaser'

const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
	anims.create({
		key: 'entity-idle-down',
		frames: [{ key: 'entity', frame: 'walk-down-3.png' }]
	})

	anims.create({
		key: 'entity-idle-up',
		frames: [{ key: 'entity', frame: 'walk-up-3.png' }]
	})

	anims.create({
		key: 'entity-idle-side',
		frames: [{ key: 'entity', frame: 'walk-side-3.png' }]
	})

	anims.create({
		key: 'entity-run-down',
		frames: anims.generateFrameNames('entity', { start: 1, end: 8, prefix: 'run-down-', suffix: '.png' }),
		repeat: -1,
		frameRate: 15
	})

	anims.create({
		key: 'entity-run-up',
		frames: anims.generateFrameNames('entity', { start: 1, end: 8, prefix: 'run-up-', suffix: '.png' }),
		repeat: -1,
		frameRate: 15
	})

	anims.create({
		key: 'entity-run-side',
		frames: anims.generateFrameNames('entity', { start: 1, end: 8, prefix: 'run-side-', suffix: '.png' }),
		repeat: -1,
		frameRate: 15
	})

	anims.create({
		key: 'entity-faint',
		frames: anims.generateFrameNames('entity', { start: 1, end: 4, prefix: 'faint-', suffix: '.png' }),
		frameRate: 15
	})
}

export {
	createCharacterAnims
}
