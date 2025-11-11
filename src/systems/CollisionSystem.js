export class CollisionSystem {
    checkCollision(item, player) {
        const itemBounds = item.getBounds();
        const playerBounds = player.getBounds();
        
        return itemBounds.x < playerBounds.x + playerBounds.width &&
               itemBounds.x + itemBounds.width > playerBounds.x &&
               itemBounds.y < playerBounds.y + playerBounds.height &&
               itemBounds.y + itemBounds.height > playerBounds.y;
    }
}
