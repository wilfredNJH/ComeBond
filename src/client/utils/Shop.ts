import Phaser from 'phaser';
import { sceneEvents } from '../events/EventsCenter'
import Entity from '../characters/Entity'; // Adjust import path as needed

class Shop {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;
    private textItems: Phaser.GameObjects.Text[] = [];
    private closeButton: Phaser.GameObjects.Text;

    // Confirmation popup elements
    private confirmContainer: Phaser.GameObjects.Container;
    private confirmBackground: Phaser.GameObjects.Rectangle;
    private confirmText: Phaser.GameObjects.Text;
    private confirmCancelButton: Phaser.GameObjects.Text;
    private confirmOkButton: Phaser.GameObjects.Text;
    private entity: Entity;

    // Items available for purchase (example data)
    public items: { name: string; price: number }[];

    private selectedIdx: number = -1; // Track the index of the selected item

    constructor(scene: Phaser.Scene, entity: Entity) {
        this.scene = scene;
        this.entity = entity;
        this.items = [
            { name: '$20 shopping voucher', price: 20 },
            { name: 'Jabra Earphones', price: 50 },
            { name: 'Coca-Cola Mug', price: 10 }
            // Add more items as needed
        ];

        const boxWidth = 500;
        const boxHeight = 400;
        const boxX = scene.cameras.main.x;
        const boxY = scene.cameras.main.y;

        // Main shop container
        this.background = scene.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0x000000, 1);
        this.background.setOrigin(0.5, 0.5);

        this.closeButton = scene.add.text(0, 180, 'Close', {
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

        // Confirmation popup container
        this.confirmBackground = scene.add.rectangle(boxX, boxY, 300, 200, 0x000000, 0.8);
        this.confirmBackground.setOrigin(0.5, 0.5);

        this.confirmText = scene.add.text(0, -50, '', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 280, useAdvancedWrap: true }
        });
        this.confirmText.setOrigin(0.5, 0.5);

        this.confirmOkButton = scene.add.text(0, 20, 'OK', {
            fontSize: '18px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.confirmPurchase();
            });

        this.confirmCancelButton = scene.add.text(0, 60, 'Cancel', {
            fontSize: '18px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.hideConfirmation();
            });

        this.confirmContainer = scene.add.container(boxX, boxY, [this.confirmBackground, this.confirmText, this.confirmOkButton, this.confirmCancelButton]);
        this.confirmContainer.setVisible(false);
        this.confirmContainer.setDepth(1001); // Ensure it's in front of other objects
    }

    showShopItems(items: { name: string; price: number }[]) {
        // Clear any previous text items
        this.textItems.forEach(item => item.destroy());
        this.textItems = [];

        let yOffset = -150;
        items.forEach((item, index) => { // Include index in forEach loop
            const text = `${item.name}: $${item.price}`;
            const textObject = this.scene.add.text(0, yOffset, text, {
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 480, useAdvancedWrap: true }
            });
            textObject.setOrigin(0.5, 0.5);
            textObject.setInteractive({ useHandCursor: true });
            textObject.on('pointerdown', () => {
                this.selectedIdx = index; // Store the index of the selected item
                this.showConfirmation(item); // Pass item to showConfirmation
            });
            this.container.add(textObject);
            this.textItems.push(textObject);

            yOffset += 30; // Adjust vertical spacing
        });

        this.container.setVisible(true);
    }

    private showConfirmation(item: { name: string; price: number }) {
        const confirmationText = `Buy ${item.name} for $${item.price}?`;
        this.confirmText.setText(confirmationText);
        this.confirmContainer.setVisible(true);
    }

    private confirmPurchase() {
        if (this.entity && this.selectedIdx !== -1) { // Check if an item is selected
            const item = this.items[this.selectedIdx]; // Get item using stored index
            if (this.entity._coins >= item.price) {
                // Deduct coins from Entity if they have enough
                this.entity._coins -= item.price;
                //console.log(`${this.entity.playerName} bought ${item.name} for $${item.price}. Remaining coins: ${this.entity._coins}`);
                // Display confirmation message
                sceneEvents.emit('success-notification', `Purchased ${item.name}!`)
                sceneEvents.emit('player-coins-changed', this.entity._coins);
            } else {
                //console.log(`${this.entity.playerName} does not have enough coins to buy ${item.name}.`);
                // Display insufficient funds message if needed
                sceneEvents.emit('failure-notification', `Not enough coins!`)
                sceneEvents.emit('player-coins-changed', this.entity._coins);
            }
        }

        this.hideConfirmation();
    }

    private hideConfirmation() {
        this.confirmContainer.setVisible(false);
    }

    hide() {
        this.container.setVisible(false);
    }

    update(playerPosX: number, playerPosY: number) {
        if (this.container.visible) {
            this.container.x = playerPosX;
            this.container.y = playerPosY;
        }

        if (this.confirmContainer.visible){
            this.confirmContainer.x = playerPosX;
            this.confirmContainer.y = playerPosY;
        }
    }
}

export default Shop;
