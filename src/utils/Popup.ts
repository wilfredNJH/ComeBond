import Phaser from 'phaser';

class Popup {
	private scene: Phaser.Scene;
	private container: Phaser.GameObjects.Container;
	private background: Phaser.GameObjects.Rectangle;
	private text: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;

		const boxWidth = 500;
		const boxHeight = 400;
		const boxX = scene.cameras.main.width / 2;
		const boxY = scene.cameras.main.height / 2;

		this.background = scene.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0x000000, 1);
		this.background.setOrigin(0.5, 0.5);

		this.text = scene.add.text(0, 0, '', {
			fontSize: '11px',
			color: '#ffffff',
			align: 'center',
			wordWrap: { width: boxWidth - 10, useAdvancedWrap: true }
		});
		this.text.setOrigin(0.5, 0.5);

		this.container = scene.add.container(boxX, boxY, [this.background, this.text]);
		this.container.setVisible(false);
		this.container.setDepth(1000); // Ensure it's in front of other objects
	}

	showMessage(message: string) {
		this.text.setText(message);
		this.container.setVisible(true);
	}

	hide() {
		this.container.setVisible(false);
	}

	showVolunteeringOpportunities() {
		const bulletinContent = `
			Volunteering Opportunities:

			Date       | Event
			-----------|------------------------
			2024-06-01 | Beach Cleanup
			2024-06-15 | Tree Planting
			2024-07-05 | Community Garden
			2024-07-20 | River Restoration
			2024-08-10 | Animal Shelter
		`;
		this.showMessage(bulletinContent);
	}
}

export default Popup;