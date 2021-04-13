class PathNode {
    static RADIUS = 5;

    constructor(x, y) {
        this.pos = createVector(x, y);
        this.out = [];
        this.in = [];
        this.__debug_id = -1;
        this.blocked = false;
        this.reservedBy = null;
    }

    getUnblockedBranches (ignoreReserved = false) {
        return this.out.filter(
            node => {
                if (node.blocked) return false;
                if (node.reservedBy != null) return ignoreReserved;
                return true;
            }
        );
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
        let blockedCol = color(255, 255, 0, 150);
        let reservedCol = color(50, 50, 255, 125);
        let defaultCol = this.isControlNode ? color (0, 255, 0, 100) : color (255, 0, 0, 100);
        let col = this.blocked ? blockedCol : defaultCol;
        stroke(col); fill(col);
        strokeWeight(1);
        if (this.isControlNode) {
            rectMode(CENTER);
            rect(this.pos.x, this.pos.y, PathNode.RADIUS * 2, PathNode.RADIUS * 2);
        }
        else {
            circle(this.pos.x, this.pos.y, PathNode.RADIUS * 2);
        }
        if (this.out.length > 0) {
            this.out.forEach(next => {
                let arrowBaseLength = 0;
                stroke(defaultCol);
                if (next.blocked) {
                    arrowBaseLength = 15;
                    stroke(blockedCol);
                }
                else if (next.reservedBy != null) {
                    stroke(reservedCol);
                }
                drawArrow(this.pos, next.pos, PathNode.RADIUS + 5, arrowBaseLength);
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
        let node = new PathNode(x, y);
        this.addNode(node);
        return node;
    }

    deleteNode(node) {
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
