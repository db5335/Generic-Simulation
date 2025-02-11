import { Injectable } from '@angular/core';
import { GraphAnimation } from '../models/graph-animation';
import Graph from 'graphology';
import { BehaviorSubject, ReplaySubject, Subject, firstValueFrom, lastValueFrom, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  state = new Subject<string | undefined>();

  #animations!: GraphAnimation[];
  #graph!: Graph;
  #step: number = 0;
  #lock = new Subject<void>();
  #running = false;
  #waiting = false;

  constructor() { }

  update(graph: Graph, animations: GraphAnimation[]): void {
    this.#graph = graph;
    this.#animations = animations;
    this.#step = 0;
  }

  async animate(): Promise<void> {
    if (this.#waiting) {
      this.#waiting = false;
      // console.log("locl")
      this.#lock.next();
      return;
    }

    this.#running = true;

    if (this.#step >= this.#animations.length) {
      return;
    }

    this.state.next(this.#animations[this.#step].state)

    for (let n of this.#animations[this.#step].nodeAnimations) {
      this.#graph.updateNode(`${n.node}`, a => {
        return {
            ...a,
            type: 'border',
            color: n.to[0],
            borderColor: n.to[1]
        }
      });
    }

    for (let e of this.#animations[this.#step].edgeAnimations) {
      this.#graph.updateEdge(`${e.u}`, `${e.v}`, a => {
        return {
            ...a,
            color: e.to
            // type: 'arrow'
        }
      });
    }

    this.#step++;
    return new Promise(resolve => setTimeout(() => {
      this.animate()
    }, this.#animations[this.#step].time ?? 1000))
  }

  async goTo(index: number): Promise<void> {
    // console.log('bbb')
    if (this.#running) {
      this.#waiting = true;
      // console.log('w')
      await firstValueFrom(this.#lock.pipe(take(1)));
      // console.log('x')
    }

    this.#running = true;
    
    if (this.#step == index) {
      // console.log('aaa')
    } else {
      // console.log('here')
      this.state.next(this.#animations[index].state)

      if (this.#step > index) {
        while (this.#step != index) {
          for (let n of this.#animations[this.#step].nodeAnimations) {
            this.#graph.updateNode(`${n.node}`, a => {
              return {
                  ...a,
                  type: 'border',
                  color: n.from[0],
                  borderColor: n.from[1]
              }
            });
          }
      
          for (let e of this.#animations[this.#step].edgeAnimations) {
            this.#graph.updateEdge(`${e.u}`, `${e.v}`, a => {
              return {
                  ...a,
                  color: e.from
                  // type: 'arrow'
              }
            });
          }

          this.#step--;
        }
      } else {
        while (this.#step != index) {
          for (let n of this.#animations[this.#step].nodeAnimations) {
            this.#graph.updateNode(`${n.node}`, a => {
              return {
                  ...a,
                  type: 'border',
                  color: n.to[0],
                  borderColor: n.to[1]
              }
            });
          }
      
          for (let e of this.#animations[this.#step].edgeAnimations) {
            this.#graph.updateEdge(`${e.u}`, `${e.v}`, a => {
              return {
                  ...a,
                  color: e.to
                  // type: 'arrow'
              }
            });
          }

          this.#step++;
        }
      }
    }

    this.#running = false;
    this.#lock.next();
  }
}
