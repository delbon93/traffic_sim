
class Switch {
    static RADIUS = 15;

    constructor(x, y) {
        this.pos = createVector(x, y);
        this.nodes = [];
    }

    addNode(node) {
        if (this.nodes.indexOf(node) < 0) this.nodes.push(node);
    }

    press() {
        this.nodes.forEach(node => {
            node.blocked = !node.blocked;
        });
    }

    draw() {
        stroke(200, 200, 200, 175);
        this.nodes.forEach(node => {
            drawArrow(this.pos, node.pos, PathNode.RADIUS + 5, 0, 1);
        });

        stroke(255, 255, 255);
        fill(100, 100, 255);
        circle(this.pos.x, this.pos.y, Switch.RADIUS * 2);

    }
}