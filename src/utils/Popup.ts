import Phaser from 'phaser';

class Popup {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private signUpButton: Phaser.GameObjects.Text;
    private closeButton: Phaser.GameObjects.Text;
    private points: number = 0;
    private currentEvent: string = '';

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        const boxWidth = 500;
        const boxHeight = 400;
        const boxX = scene.cameras.main.width / 2;
        const boxY = scene.cameras.main.height / 2;

        this.background = scene.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0x000000, 1);
        this.background.setOrigin(0.5, 0.5);

        this.text = scene.add.text(0, -100, '', {
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: boxWidth - 20, useAdvancedWrap: true }
        });
        this.text.setOrigin(0.5, 0.5);

        this.signUpButton = scene.add.text(0, 50, 'Sign Up', {
            fontSize: '18px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.signUp();
            });

        this.closeButton = scene.add.text(0, 100, 'Close', {
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

        this.container = scene.add.container(boxX, boxY, [this.background, this.text, this.signUpButton, this.closeButton]);
        this.container.setVisible(false);
        this.container.setDepth(1000); // Ensure it's in front of other objects
    }

    showMessage(message: string, event: string) {
        this.text.setText(message);
        this.currentEvent = event;
        this.container.setVisible(true);
    }

    hide() {
        this.container.setVisible(false);
    }

    showVolunteeringOpportunities() {
        const bulletinContent = `
            Volunteering Opportunities:

            Date       | Event
            2024-06-01 | Beach Cleanup
            2024-06-15 | Tree Planting
            2024-07-05 | Community Garden
            2024-07-20 | River Restoration
            2024-08-10 | Animal Shelter
        `;
        this.showMessage(bulletinContent, 'Volunteering');
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

        const selectedEvent = this.currentEvent;
        const pointsEarned = pointsMapping[selectedEvent] || 10; // Default to 10 if event not found
        this.points += pointsEarned;

        // Emit an event to update the points in the game scene
        this.scene.registry.set('points', this.points);
        this.scene.registry.events.emit('points-changed', this.points);

        this.hide();
    }
}

export default Popup;