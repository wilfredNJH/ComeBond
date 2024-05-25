import 'regenerator-runtime/runtime'
import Phaser from 'phaser'


import Preloader from './client/scenes/Preloader'
import Game from './client/scenes/Game'
import StartScreen from './client/scenes/StartScreen'
import GameUI from './client/scenes/GameUI'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			// gravity: { y: 200 },
		},
	},
	scene: [ Preloader, StartScreen, Game, GameUI],
}

export default new Phaser.Game(config)
