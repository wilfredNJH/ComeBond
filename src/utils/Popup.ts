import Phaser from 'phaser';

class Popup {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;
    private textItems: Phaser.GameObjects.Text[] = [];
    private closeButton: Phaser.GameObjects.Text;
    private points: number = 0;
    private currentEvent: string = '';
    
    // Sign-Up Popup elements
    private signUpContainer: Phaser.GameObjects.Container;
    private signUpBackground: Phaser.GameObjects.Rectangle;
    private signUpText: Phaser.GameObjects.Text;
    private signUpCloseButton: Phaser.GameObjects.Text;
    private signUpConfirmButton: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        const boxWidth = 500;
        const boxHeight = 400;
        const boxX = scene.cameras.main.x;
        const boxY = scene.cameras.main.x;

        this.background = scene.add.rectangle(scene.cameras.main.x, scene.cameras.main.y, boxWidth, boxHeight, 0x000000, 1);
        this.background.setOrigin(0.5, 0.5);

		this.closeButton = scene.add.text(0, 150, 'Close', {
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

        // Create sign-up form popup
        this.signUpBackground = scene.add.rectangle(boxX, boxY, 300, 200, 0x000000, 0.8);
        this.signUpBackground.setOrigin(0.5, 0.5);

        this.signUpText = scene.add.text(0, -50, '', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 280, useAdvancedWrap: true }
        });
        this.signUpText.setOrigin(0.5, 0.5);

        this.signUpConfirmButton = scene.add.text(0, 20, 'Confirm Sign-Up', {
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

        this.signUpCloseButton = scene.add.text(0, 60, 'Close', {
            fontSize: '18px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.hideSignUp();
            });

        this.signUpContainer = scene.add.container(boxX, boxY, [this.signUpBackground, this.signUpText, this.signUpConfirmButton, this.signUpCloseButton]);
        this.signUpContainer.setVisible(false);
        this.signUpContainer.setDepth(1001); // Ensure it's in front of other objects
    }


    showVolunteeringOpportunities() {
		const bulletinContent = [
            { date: '2024-06-01', event: 'Beach Cleanup' },
            { date: '2024-06-15', event: 'Tree Planting' },
            { date: '2024-07-05', event: 'Community Garden' },
            { date: '2024-07-20', event: 'River Restoration' },
            { date: '2024-08-10', event: 'Animal Shelter' },
        ];

        // Clear any previous text items
        this.textItems.forEach(item => item.destroy());
        this.textItems = [];

        let yOffset = -100;
        bulletinContent.forEach((item) => {
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
        this.showSignUpForm(item);
    }


    private showSignUpForm(item: { date: string; event: string }) {
        const formContent = `Sign up for:\n${item.event}\non ${item.date}`;
        this.signUpText.setText(formContent);
        this.signUpContainer.setVisible(true);
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

        this.hideSignUp();
        this.hide();
    }

    private hideSignUp() {
        this.signUpContainer.setVisible(false);
    }

    hide() {
        this.container.setVisible(false);
    }

    update(playerPosX, playerPosY){
       // if container visible 
	   if (this.container.visible) {
		this.container.x = playerPosX;
		this.container.y = playerPosY;
	}

	// Update position of sign-up container
	if (this.signUpContainer.visible) {
		this.signUpContainer.x = playerPosX;
		this.signUpContainer.y = playerPosY;
	}
    }
}

export default Popup;