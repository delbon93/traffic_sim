class Node {
    static RADIUS = 5;

    constructor(x, y) {
        this.pos = createVector(x, y);
        this.out = [];
        this.in = [];
        this.__debug_id = -1;
    }

    set next(next) {
        this.out = [next];
        if (next != null) next.in.push(this);
    }

    get isPathNode() { return this.out.length < 2; }

    get isControlNode() { return !this.isPathNode; }

    addBranch(next) {
        if (next === this) return;
        if (this.out.indexOf(next) < 0) {
            this.out.push(next);
            if (next != null) next.in.push(this);
        }
    }

    deleteBranch(next, reverse=true) {
        let i = this.out.indexOf(next);
        if (i >= 0) {
            if (reverse) this.out[i]._deleteIn(this);
            this.out.splice(i, 1);
        }
    }

    _deleteIn(_in) {
        let i = this.in.indexOf(_in);
        if (i >= 0) {
            this.in.splice(i, 1);
        }
    }

    draw() {
        strokeWeight(1);
        if (this.isControlNode) {
            fill(0, 255, 0, 100);
            stroke(0, 255, 0, 100);
            rectMode(CENTER);
            rect(this.pos.x, this.pos.y, Node.RADIUS * 2, Node.RADIUS * 2);
        }
        else {
            fill(255, 0, 0, 100);
            stroke(255, 0, 0, 100);
            circle(this.pos.x, this.pos.y, Node.RADIUS * 2);
        }
        if (this.out.length > 0) {
            this.out.forEach(next => {
                drawArrow(this, next);
            });
        }
    }

    printDebugInfo() {
        console.log("Node #" + this.__debug_id 
            + "\n\tpos=[" + this.pos.x + ", " + this.pos.y 
            + "]\n\tin=[" + this.in 
            + "]\n\tout=[" + this.out + "]");
    }

    toString() {
        return "#" + this.__debug_id;
    }
}


class Graph {
    constructor() {
        this.nodes = [];
        this.__debug_id_counter = 0;
    }

    addNode(node) {
        this.nodes.push(node);
        node.__debug_id = this.__debug_id_counter;
        this.__debug_id_counter++;
    }

    createNode(x, y) {
        let node = new Node(x, y);
        this.addNode(node);
        return node;
    }

    deleteNode(node) {
        node.out.forEach(next => {
            node.deleteBranch(next);
        });
        node.in.forEach(prev => {
            prev.deleteBranch(node, false);
        });
        this.nodes.splice(this.nodes.indexOf(node), 1);
    }

    draw() {
        this.nodes.forEach(node => {
            node.draw();
        });
    }

    getClosestNodeTo(x, y) {
        let dist = Infinity;
        let closest = null;
        let p = createVector(x, y);
        this.nodes.forEach(node => {
            let d = p5.Vector.sub(p, node.pos).magSq();
            if (d < dist) {
                dist = d;
                closest = node;
            }
        });
        return { node: closest, distance: sqrt(dist) };
    }

    getNodesInRect(x0, y0, x1, y1) {
        let nodesInRect = [];
        this.nodes.forEach(node => {
            if (node.pos.x >= x0 && node.pos.x <= x1
                && node.pos.y >= y0 && node.pos.y <= y1) {
                    nodesInRect.push(node);
                }
        });
        return nodesInRect;
    }
}
