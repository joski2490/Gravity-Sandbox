import Vector2 from "./Vector2";
import Body from './Body';

function gravity(G:number, m1:number, m2:number, dist:number) {
    return (G * m1 * m2) / ((dist * dist) + 9000);
}

export default class Universe {
  bodies: Body[];
  previousPlacedCoords: {};
  lastAddedBody = [];
  lastRemovedBody = [];

  constructor() {
    this.bodies = [];
    this.previousPlacedCoords = {};
  }

  addBody(b: Body, x:number, y:number) {
    if (!this.previousPlacedCoords[`${x}:${y}`]) {
      b.position.set(x, y);

      this.bodies.push(b);
      this.lastAddedBody.push(b);

      this.previousPlacedCoords[`${x}:${y}`] = true;
    }
  }

  undoLastPlacedBody() {
    if (this.lastAddedBody.length) {
      const lastAddedBody = this.lastAddedBody[this.lastAddedBody.length-1];
      this.bodies = this.bodies.filter(body => body !== lastAddedBody);
      this.lastAddedBody.pop();
      this.lastRemovedBody.push(lastAddedBody);
    }
  }

  redoLastPlacedBody() {
    if (this.lastRemovedBody.length) {
      const lastRemovedBody = this.lastRemovedBody[this.lastRemovedBody.length-1];
      this.bodies.push(lastRemovedBody);
      this.lastAddedBody.push(lastRemovedBody)
      this.lastRemovedBody.pop();
    }
  }

  getBodyByPoint(x:number, y:number) {
    let result = null;

    this.bodies.forEach(body => {
      const pointVector = new Vector2(x, y);
      pointVector.subtract(body.position);
      const length = pointVector.length();
      if (body.size > length) {
        result =  body;
      }
    })

    return result;
  }

  clear() {
    this.bodies = [];
    this.previousPlacedCoords = {};
  }

  update(dt:number, G:number) {
    this.previousPlacedCoords = {};
    // Calculate gravitational forces between all bodies. We need at least
    // two bodies to do this, of course.
    if (this.bodies.length > 1) {
      for (let i = 0; i < this.bodies.length; i++) {
        for (let j = 0; j < this.bodies.length; j++) {
          let b1 = this.bodies[i];
          let b2 = this.bodies[j];

          if (b1 !== b2) {
            let force = gravity(G, b1.mass, b2.mass, b1.distance(b2));
            let acceleration = new Vector2(b1.position);
            acceleration.subtract(b2.position);
            acceleration.normalize();
            acceleration.scale(force/b1.mass);
            b1.velocity.x -= acceleration.x * dt;
            b1.velocity.y -= acceleration.y * dt;
          }
        }
      }
    }

    // Remove dead bodies
    this.bodies = this.bodies.filter(body => !body.dead);

    // Move universe forward
    this.bodies.forEach(body => {
      body.update(dt);
    });
  }

  // Draw
  draw(context:CanvasRenderingContext2D, showTail: boolean) {
    this.bodies.forEach(body => body.draw(context, showTail));
  }
}