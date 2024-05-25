import Phaser from 'phaser';

class Popup {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;	
    private textItems: Phaser.GameObjects.Text[] = [];
    private closeButton: Phaser.GameObjects.Text;
    private points: number = 0;
    private currentEvent: string = '';

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        const boxWidth = 500;
        const boxHeight = 600;
        const boxX = scene.cameras.main.x;
        const boxY = scene.cameras.main.x;

        this.background = scene.add.rectangle(scene.cameras.main.x, scene.cameras.main.y, boxWidth, boxHeight, 0x000000, 1);
        this.background.setOrigin(0.5, 0.5);

        this.closeButton = scene.add.text(0, 200, 'Close', {
            fontSize: '18px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.hide();
            });

			

        this.container = scene.add.container(boxX, boxY, [this.background, this.closeButton]);
        this.container.setVisible(false);
        this.container.setDepth(1000); // Ensure it's in front of other objects
    }



	showVolunteeringOpportunities() {
        const bulletinContent = [
            { date: '2024-06-22', event: 'Beach Cleanup' },
            { date: '2024-06-15', event: 'Tree Planting' },
            { date: '2024-07-05', event: 'Community Garden' },
            { date: '2024-07-20', event: 'River Restoration' },
            { date: '2024-08-10', event: 'Animal Shelter' },
        ];

       // Clear any previous text items
	   this.textItems.forEach(item => item.destroy());
	   this.textItems = [];

	   let yOffset = -100;
	   bulletinContent.forEach((item, index) => {
		   const text = `${item.date} | ${item.event}`;
		   const textObject = this.scene.add.text(0, yOffset, text, {
			   fontSize: '14px',
			   color: '#00ff00',
			   align: 'center',
			   wordWrap: { width: 480, useAdvancedWrap: true }
		   });
		   textObject.setOrigin(0.5, 0.5);
		   textObject.setInteractive({ useHandCursor: true });
		   textObject.on('pointerdown', () => this.handleItemClick(item));
		   this.container.add(textObject);
		   this.textItems.push(textObject);

		   yOffset += 30; // Adjust vertical spacing
	   });
	   this.container.setVisible(true);
    }

    private handleItemClick(item: { date: string; event: string }) {
        this.currentEvent = item.event;
        this.signUp();
    }

    private signUp() {
        // Points system based on events
		const pointsMapping: { [key: string]: number } = {
            'Beach Cleanup': 10,
            'Tree Planting': 15,
            'Community Garden': 20,
            'River Restoration': 25,
            'Animal Shelter': 30
        };

        const pointsEarned = pointsMapping[this.currentEvent] || 10; // Default to 10 if event not found
        this.points += pointsEarned;

        // Emit an event to update the points in the game scene
        this.scene.registry.set('points', this.points);
        this.scene.registry.events.emit('points-changed', this.points);

        this.hide();
    }

	hide() {
        this.container.setVisible(false);
    }

    update(playerPosX: number, playerPosY: number) {
        // if container visible 
        if (this.container.visible) {
            this.container.x = playerPosX;
            this.container.y = playerPosY;
        }
    }
}

export default Popup;