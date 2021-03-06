class TrafficAgent {
    constructor(x, y, graph) {
        this.pos = createVector(x, y);
        this.dir = createVector(1, 0);
        this.right = createVector(0, 1);
        this.vmax = 15.0;
        this.targetNode = null;
        this.graph = graph;
        this.col = color(255);
    }

    setTarget(targetNode) {
        this.targetNode = targetNode;
    }

    lookAt(v) {
        this.dir = createVector(v.x - this.pos.x, v.y - this.pos.y);
        this.dir.normalize();
        this.right = createVector(this.dir.x, this.dir.y);
        this.right.rotate(HALF_PI);
    }

    move(delta) {
        if (delta < 0.001) return;
        let speed = this.vmax * delta / 1000;
        let step = p5.Vector.mult(this.dir, speed);
        this.pos.add(step.x, step.y);
    }

    draw() {
        let width = 12;
        let length = 20;
        let base = p5.Vector.sub(this.pos, p5.Vector.mult(this.dir, length / 2));
        let l = p5.Vector.sub(base, p5.Vector.mult(this.right, width / 2));
        let r = p5.Vector.add(base, p5.Vector.mult(this.right, width / 2));
        let tip = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, length / 2));
        strokeWeight(2);
        stroke(this.col);
        
        fill(this.col);
        beginShape(TRIANGLES); 
        vertex(l.x, l.y); vertex(r.x, r.y); vertex(tip.x, tip.y); 
        endShape(CLOSE);
        
        strokeWeight(1);
    }

    update(delta) {
        if (this.targetNode === null) {
            if (this.graph.nodes.length === 0) return;
            this.targetNode = this.graph.getClosestNodeTo(this.pos.x, this.pos.y).node;
        }
        if (!this.targetNode.active) 
            this.targetNode = this.graph.getClosestNodeTo(this.pos.x, this.pos.y).node;
        if (this.targetNode === null) return; // Graph must be empty, hmmm...

        let distanceThreshold = 5;

        if (p5.Vector.sub(this.targetNode.pos, this.pos).mag() < distanceThreshold) {
            let possibleBranches = this.targetNode.getUnblockedBranches(this);
            if (possibleBranches.length > 0) {
                this.targetNode.clearReserved();
                this.targetNode = getRandomArrayItem(possibleBranches);
                this.targetNode.reserve(this);
            }
        }
        else {
            this.lookAt(this.targetNode.pos);
            this.move(delta);
        }
    }
}