class TrafficAgent {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.dir = createVector(1, 0);
        this.right = createVector(0, 1);
        this.vmax = 15.0;
        this.targetNode = null;
        this.waitingForPath = false;
    }

    setTarget(targetNode) {
        this.targetNode = targetNode;
    }

    lookAt(v) {
        this.dir = createVector(v.x - this.pos.x, v.y - this.pos.y);
        this.dir.normalize();
        this.right = createVector(this.dir.x, this.dir.y);
        this.right.rotate(QUARTER_PI);
    }

    move(delta) {
        let speed = this.vmax / delta;
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
        strokeWeight(3);
        stroke(90, 90, 225);
        fill(120, 120, 255);
        beginShape(TRIANGLES); 
        vertex(l.x, l.y); vertex(r.x, r.y); vertex(tip.x, tip.y); 
        endShape(CLOSE);
        
        strokeWeight(1);
    }

    update(delta) {
        if (this.targetNode == null) return;

        let distanceThreshold = 5;

        if (p5.Vector.sub(this.targetNode.pos, this.pos).mag() < distanceThreshold) {
            if (this.targetNode.out.length > 0) {
                this.targetNode = getRandomArrayItem(this.targetNode.out);
            }
        }
        else {
            this.lookAt(this.targetNode.pos);
            this.move(delta);
        }
    }
}