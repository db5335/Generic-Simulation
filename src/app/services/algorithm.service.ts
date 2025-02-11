import { Injectable } from '@angular/core';
import Graph from 'graphology';
import { GraphLevel } from '../models/graph-level';
import { GraphAnimation } from '../models/graph-animation';
import { NodeAnimation } from '../models/node-animation';
import { EdgeAnimation } from '../models/edge-animation';
import { NEIGHBORS } from '../models/constants';
import { Subject } from 'rxjs';
import { cluster } from 'd3';

@Injectable({
  providedIn: 'root'
})
export class AlgorithmService {

  readonly #ALPHA = 5;
  readonly #CLUSTERS = 'clusters';
  readonly #DOWNCAST_TIME = 200;
  readonly #INBOX = 'inbox';
  readonly #INTERCAST_TIME = 200;
  readonly #LISTEN = 'listen';
  readonly #MESSAGE = 'message';
  readonly #RADII = 'radii';
  readonly #RANDOM = 'random';
  readonly #SLEEP = 'sleep';
  readonly #STASH = 'stash';
  readonly #STATUS = 'status';
  readonly #TRUE_RADII = 'trueRadii';
  readonly #UPCAST_TIME = 200;
  readonly #WAKE_UP = 'wakeUp';

  readonly COLORS = [
    "red",
    "green",
    "orange",
    "blue",
    "yellow",
    "purple",
    "pink",
    "brown",
    // "black",
    "aqua",
    "cyan",
    'crimson'
  ];

  #nodeColors: any[] = [];
  #edgeColors: any[] = [];

  state = new Subject<string>();

  constructor() { }

  // generateClusters(graph: Graph, radius: number): GraphAnimation[] {
  //   const n = graph.nodes().length;
  //   let assigned = 0;
  //   let col = 0;
  //   const r = [];
  //   const c: any[] = [];
  //   const d = [];
  //   let minimumValue = 0;
    
  //   for (let j = 0; j < n; j++) {
  //     const value = Math.floor(radius * Math.log(Math.random()))
  //     minimumValue = Math.min(value, minimumValue);
  //     r.push(value);
  //     c.push(null)
  //     d.push(null)
  //   }

  //   console.log(r)

  //   const animations = [];

  //   let rd = minimumValue;
  //   while (assigned < n) {
  //     const nodeAnimations: NodeAnimation[] = [];
  //     const edgeAnimations: EdgeAnimation[] = [];
  //     const animation: GraphAnimation = {
  //       nodeAnimations,
  //       edgeAnimations
  //     };

  //     for (let j = 0; j < n; j++) {
  //         if (d[j] != null && c[j] != 'Done') {
  //             for (let k of graph.getNodeAttribute(`${j}`, 'neighbors')) {
  //                 if (c[k] == null) {
  //                     c[k] = c[j]
  //                     assigned++;
  //                     edgeAnimations.push({
  //                       u: Math.min(j, k),
  //                       v: Math.max(j, k),
  //                       from: 'gray',
  //                       to: c[k]
  //                     });
  //                     nodeAnimations.push({
  //                       node: k,
  //                       from: 'gray',
  //                       to: c[k]
  //                     })
  //                     // graphLevel.graph.updateNode("" + k, a => {
  //                     //     return {
  //                     //         ...a,
  //                     //         color: c[k]
  //                     //     }
  //                     // })
  //                 }
  //             }
  //             c[j] = 'Done'
  //         }
  //     }

  //       for (let j = 0; j < n; j++) {
  //           d[j] = c[j];
  //       }

  //       for (let j = 0; j < n; j++) {
  //           if (r[j] == rd && c[j] == null) {
  //               c[j] = this.COLORS[col % this.COLORS.length];
  //               d[j] = c[j]
  //               nodeAnimations.push({
  //                 node: j,
  //                 from: 'gray',
  //                 to: c[j]
  //               });
  //               // graphLevel.graph.updateNode("" + j, a => {
  //               //     return {
  //               //         ...a,
  //               //         color: c[j]
  //               //     }
  //               // })
  //               assigned++;
  //               col++;
  //           }
  //       }

  //       rd++;
  //       animations.push(animation);
  //   }

  //   return animations;
  // }

  bfs(graph: Graph): GraphAnimation[] {
    const animations: GraphAnimation[] = [];
    const n = graph.nodes().length;

    for (let u = 0; u < n; u++) {
      this.#nodeColors.push(['gray', 'gray', Math.random()]);
      this.#edgeColors.push([]);
      const neighbors = graph.getNodeAttribute(`${u}`, NEIGHBORS);
      for (let v = 0; v < n; v++) {
        this.#edgeColors[u].push(null);
      }
      for (let v of neighbors) {
        if (v > u) {
          this.#edgeColors[u][v] = [0, 'lightgray', Math.random()];
        }
      }
    }

    return animations;
  }

  buildClusters(graph: Graph, radius: number): GraphAnimation[] {
    const animations: GraphAnimation[] = [];
    
    const n = graph.nodes().length;
    
    const radii = [2, 4, 8, n]
    graph.setAttribute(this.#RADII, radii);
    const trueRadii: number[] = [];
    graph.setAttribute(this.#TRUE_RADII, trueRadii);

    for (let u = 0; u < n; u++) {
      const attr = graph.getNodeAttributes(`${u}`);
      attr[this.#CLUSTERS] = [];
      attr[this.#INBOX] = [];
    }

    for (let l = 0; l < 4; l++) {
      let minimumValue = 0;
      for (let u = 0; u < n; u++) {
        let value = Math.floor(radii[l] * Math.log(Math.random()))
        if (l == 3) {
          if (u == 0) {
            value = -1 * n;
          } else {
            value = 0;
          }
        }
        minimumValue = Math.min(value, minimumValue);
        graph.setNodeAttribute(`${u}`, this.#RANDOM, value);
        const attr = graph.getNodeAttributes(`${u}`);
        attr[this.#INBOX] = [];
        attr[this.#WAKE_UP] = 0;
      }
      trueRadii.push(-1 * minimumValue);
  
      let i = 0;
      const f: Function = (attributes: Record<string, any>, round: number, execute: boolean): void => {
        if (attributes[this.#WAKE_UP] > round) {
          // if (level == 1) console.log('a')
          attributes[this.#STATUS] = this.#SLEEP;
        } else if (attributes[this.#CLUSTERS].length > l) {
          // if (level == 1) console.log('b')
          attributes[this.#STATUS] = this.#SLEEP;
        } else if (attributes[this.#INBOX].length > 0) {
          // if (level == 1) console.log('c')
          const cluster = [...attributes[this.#INBOX][0][1]];
          cluster[2] = cluster[2] + 1;
          if (execute) {
            attributes[this.#CLUSTERS].push(cluster);
          }
          attributes[this.#STATUS] = cluster;
        } else if (attributes[this.#RANDOM] == minimumValue + round) {
          // if (level == 1) console.log('d')
          const status = [i, this.COLORS[i++ % this.COLORS.length], 0];
          if (execute) {
            attributes[this.#CLUSTERS].push(status);
          }
          attributes[this.#STATUS] = status;
        } else {
          // if (level == 1) console.log('e')
          attributes[this.#STATUS] = this.#LISTEN;
        }
        // if (l == 1) console.log(attributes[this.#STATUS])
      };
  
      animations.push(...this.simulate(graph, l, 0, -1 * minimumValue, f, l == 1));
    }
    
    return animations;
  }

  simulate(graph: Graph, level: number, start: number, end: number, f: Function, debug = false): GraphAnimation[] {
    // debugger;
    const animations: GraphAnimation[] = [];
    const n = graph.nodes().length;

    if (level == 0) {
      // if (debug == true) console.log(start, end)
      // const clusterLevel = graph.getNodeAttributes('1')[this.#CLUSTERS].length;
      for (let round = start; round < end; round++) {
        const id = Math.random();

        const nodeAnimations: NodeAnimation[] = [];
        const edgeAnimations: EdgeAnimation[] = [];
        const animation: GraphAnimation = {
          state: `Simulate at level ${level}`,
          nodeAnimations,
          edgeAnimations
        };
        animations.push(animation);
    
        for (let u = 0; u < n; u++) {
          const uAttr = graph.getNodeAttributes(`${u}`);
          f(uAttr, round, true);
          uAttr[this.#INBOX] = [];
        }
  
        let maxClusterLevel = 0;
        for (let u = 0; u < n; u++) {
          const uAttr = graph.getNodeAttributes(`${u}`);
          const status = uAttr[this.#STATUS];
          
          maxClusterLevel = Math.max(maxClusterLevel, uAttr[this.#CLUSTERS].length);
          if (this.#isMessage(status)) {
            for (let v of uAttr[NEIGHBORS]) {
              const vAttr = graph.getNodeAttributes(`${v}`);
              if (vAttr[this.#STATUS] == this.#LISTEN) {
                // if (debug) console.log("did stuff")
                vAttr[this.#INBOX].push([u, status]);
              }
            }
          }
        }

        // console.log(maxClusterLevel)
  
        for (let u = 0; u < n; u++) {
          const uAttr = graph.getNodeAttributes(`${u}`);
          if (this.#isMessage(uAttr[this.#STATUS])) {
            const clusterLevel = uAttr[this.#CLUSTERS].length - 1;
            const newColor: [string, string, number] = [uAttr[this.#CLUSTERS][clusterLevel][1], uAttr[this.#CLUSTERS][clusterLevel][1], id];
            if (this.#nodeColorChange(this.#nodeColors[u], newColor)) {
              nodeAnimations.push({
                node: u,
                from: this.#nodeColors[u].slice(0, 2),
                to: newColor.slice(0, 2) as any
              });
            }
            this.#nodeColors[u] = newColor;
          } else if (uAttr[this.#INBOX].length > 0) {
            const message = uAttr[this.#INBOX][Math.floor(Math.random() * uAttr[this.#INBOX].length)];
            uAttr[this.#INBOX] = [message];
            const v = message[0];
            const vAttr = graph.getNodeAttributes(`${v}`);
            const clusterLevel = vAttr[this.#CLUSTERS].length - 1;

            const newColor: [string, string, number] = [vAttr[this.#CLUSTERS][clusterLevel][1], vAttr[this.#CLUSTERS][clusterLevel][1], id];
            if (this.#nodeColorChange(this.#nodeColors[u], newColor)) {
              nodeAnimations.push({
                node: u,
                from: this.#nodeColors[u].slice(0, 2),
                to: newColor.slice(0, 2) as any
              });
            }
            this.#nodeColors[u] = newColor;

            const newEdgeColor: [number, string, number] = [0, vAttr[this.#CLUSTERS][clusterLevel][1], id];
            const n1 = Math.min(u, v);
            const n2 = Math.max(u, v);
            if (this.#edgeColorChange(this.#edgeColors[n1][n2], newEdgeColor)) {
              edgeAnimations.push({
                u: n1,
                v: n2,
                from: this.#edgeColors[n1][n2][1],
                to: newEdgeColor[1]
              });
            }
            this.#edgeColors[n1][n2] = newEdgeColor;
          } else if (uAttr[this.#STATUS] == this.#LISTEN) {
            // TODO: Figure this out.
            // const newColor: [string, string, number] = ['gray', uAttr[this.#CLUSTERS][maxClusterLevel - 1]?.[1] ?? 'black', id];
            const newColor: [string, string, number] = ['gray', 'black', id];
            if (this.#nodeColors[u][2] != id && this.#nodeColorChange(this.#nodeColors[u], newColor)) {
              nodeAnimations.push({
                node: u,
                from: this.#nodeColors[u].slice(0, 2),
                to: newColor.slice(0, 2) as any
              });
              this.#nodeColors[u] = newColor;
            }
          } else if (uAttr[this.#STATUS] == this.#SLEEP) {
            // TODO: Figure this out.
            const newColor: [string, string, number] = ['white', uAttr[this.#CLUSTERS][maxClusterLevel - 1]?.[1] ?? 'black', id];
            if (this.#nodeColors[u][2] != id && this.#nodeColorChange(this.#nodeColors[u], newColor)) {
              nodeAnimations.push({
                node: u,
                from: this.#nodeColors[u].slice(0, 2),
                to: newColor.slice(0, 2) as any
              });
              this.#nodeColors[u] = newColor;
            }
          }
        }

        const newEdgeColor: [number, string, number] = [0, 'lightgray', id];
        for (let u = 0; u < n; u++) {
          for (let v = u + 1; v < n; v++) {
            if (this.#edgeColors[u][v] && this.#edgeColors[u][v][2] != id && this.#edgeColorChange(this.#edgeColors[u][v], newEdgeColor)) {
              edgeAnimations.push({
                u,
                v,
                from: this.#edgeColors[u][v][1],
                to: newEdgeColor[1]
              });
              this.#edgeColors[u][v] = newEdgeColor;
            }
          }
        }
      }
      // if (debug) console.log(animations)
      for (let u = 0; u < n; u++) {
        const uAttr = graph.getNodeAttributes(`${u}`);
        uAttr[this.#STASH] = uAttr[this.#INBOX];
      }
    } else {
      const radius = graph.getAttribute(this.#RADII)[level];
      const numberOfIntervals = Math.ceil((end - start) / radius);
      // console.log(start, end, radius, numberOfIntervals);
      for (let i = 0; i < numberOfIntervals; i++) {
        for (let u = 0; u < n; u++) {
          const uAttr = graph.getNodeAttributes(`${u}`);
          uAttr[this.#MESSAGE] = false;
          for (let round = 0; round < radius; round++) {
            uAttr[this.#INBOX] = uAttr[this.#STASH];
            f(uAttr, start + i * radius + round, false);
            if (this.#isMessage(uAttr[this.#STATUS])) {
              uAttr[this.#MESSAGE] = !!uAttr[this.#STATUS];
              break;
            }
          }
        }
        animations.push(...this.#notify(graph, level - 1));
        for (let u = 0; u < n; u++) {
          const uAttr = graph.getNodeAttributes(`${u}`);
          if (!uAttr[this.#MESSAGE]) {
            uAttr[this.#WAKE_UP] = start + (i + 1) * radius;
          }
          uAttr[this.#INBOX] = uAttr[this.#STASH];
        }
        animations.push(...this.simulate(graph, level - 1, start + i * radius, start + (i + 1) * radius, f, debug));
      }
    }

    // for (let u = 0; u < n; u++) {
    //   graph.updateNode(`${u}`, (a) => {
    //     return {...a, label: graph.getNodeAttribute(`${u}`, this.#CLUSTERS)[0][2]}
    //   })
    // }

    return animations;
  }

  #notify(graph: Graph, level: number): GraphAnimation[] {
    const animations: GraphAnimation[] = [];

    // for (let i = 0; i < this.#ALPHA; i++) {
    for (let i = 0; i < 1; i++) {
      animations.push(...this.#upcast(graph, level));
      animations.push(...this.#downcast(graph, level));
      animations.push(...this.#intercast(graph, level));
    }

    animations.push(...this.#upcast(graph, level));
    animations.push(...this.#downcast(graph, level));

    return animations;
  }

  #upcast(graph: Graph, level: number): GraphAnimation[] {
    const animations: GraphAnimation[] = [];
    const n = graph.nodes().length;

    const radius = graph.getAttribute(this.#TRUE_RADII)[level];
    for (let i = radius - 1; i >= 0; i--) {
      const id = Math.random();

      const nodeAnimations: NodeAnimation[] = [];
      const edgeAnimations: EdgeAnimation[] = [];
      const animation: GraphAnimation = {
        state: `Upcast at level ${level}`,
        time: this.#UPCAST_TIME,
        nodeAnimations,
        edgeAnimations
      };
      animations.push(animation);

      for (let u = 0; u < n; u++) {
        const uAttr = graph.getNodeAttributes(`${u}`);
        uAttr[this.#INBOX] = [];
      }

      for (let u = 0; u < n; u++) {
        const uAttr = graph.getNodeAttributes(`${u}`);
        const dist = uAttr[this.#CLUSTERS][level][2];
        if (dist == i) {
          if (uAttr[this.#MESSAGE]) {
            const newColor: [string, string, number] = [uAttr[this.#CLUSTERS][level][1], uAttr[this.#CLUSTERS][level][1], id];
            if (this.#nodeColorChange(this.#nodeColors[u], newColor)) {
              nodeAnimations.push({
                node: u,
                from: this.#nodeColors[u].slice(0, 2),
                to: newColor.slice(0, 2) as any
              });
            }
            
            this.#nodeColors[u] = newColor;

            for (let v of uAttr[NEIGHBORS]) {
              const vAttr = graph.getNodeAttributes(`${v}`);
              if (uAttr[this.#CLUSTERS][level][0] == vAttr[this.#CLUSTERS][level][0]) {
                vAttr[this.#INBOX].push([u, true])
              }
            }
          }
        }
      }

      for (let u = 0; u < n; u++) {
        const uAttr = graph.getNodeAttributes(`${u}`);
        const dist = uAttr[this.#CLUSTERS][level][2];
        if (dist == i - 1) {
          const newColor: [string, string, number] = [uAttr[this.#CLUSTERS][level][1], uAttr[this.#CLUSTERS][level][1], id];
          if (this.#nodeColorChange(this.#nodeColors[u], newColor)) {
            nodeAnimations.push({
              node: u,
              from: this.#nodeColors[u].slice(0, 2),
              to: newColor.slice(0, 2) as any
            });
            this.#nodeColors[u] = newColor;
          }
          if (uAttr[this.#INBOX].length > 0) {
            const message = uAttr[this.#INBOX][Math.floor(Math.random() * uAttr[this.#INBOX].length)];
            const v = message[0];
            const vAttr = graph.getNodeAttributes(`${v}`);
            
            uAttr[this.#MESSAGE] = true;
  
            const newEdgeColor: [number, string, number] = [0, vAttr[this.#CLUSTERS][level][1], id];
            const n1 = Math.min(u, v);
            const n2 = Math.max(u, v);
            if (this.#edgeColorChange(this.#edgeColors[n1][n2], vAttr[this.#CLUSTERS][level][1])) {
              edgeAnimations.push({
                u: n1,
                v: n2,
                from: this.#edgeColors[n1][n2][1],
                to: newEdgeColor[1]
              });
              this.#edgeColors[n1][n2] = newEdgeColor;
            }
          }
        } else {
          const newColor: [string, string, number] = ['white', uAttr[this.#CLUSTERS][level][1], id];
          if (this.#nodeColors[u][2] != id && this.#nodeColorChange(this.#nodeColors[u], newColor)) {
            nodeAnimations.push({
              node: u,
              from: this.#nodeColors[u].slice(0, 2),
              to: newColor.slice(0, 2) as any
            });
            this.#nodeColors[u] = newColor;
          }
        }
        
        uAttr[this.#INBOX] = [];
      }

      const newEdgeColor: [number, string, number] = [0, 'lightgray', id];
      for (let u = 0; u < n; u++) {
        for (let v = u + 1; v < n; v++) {
          if (this.#edgeColors[u][v] && this.#edgeColors[u][v][2] != id && this.#edgeColorChange(this.#edgeColors[u][v], newEdgeColor)) {
            
            edgeAnimations.push({
              u,
              v,
              from: this.#edgeColors[u][v][1],
              to: newEdgeColor[1]
            });
            this.#edgeColors[u][v] = newEdgeColor;
          }
        }
      }
    }

    return animations;
  }
  
  #downcast(graph: Graph, level: number): GraphAnimation[] {
    const animations: GraphAnimation[] = [];
    const n = graph.nodes().length;

    const radius = graph.getAttribute(this.#TRUE_RADII)[level];
    for (let i = 0; i < radius; i++) {
      const id = Math.random();

      const nodeAnimations: NodeAnimation[] = [];
      const edgeAnimations: EdgeAnimation[] = [];
      const animation: GraphAnimation = {
        state: `Downcast at level ${level}`,
        time: this.#DOWNCAST_TIME,
        nodeAnimations,
        edgeAnimations
      };
      animations.push(animation);

      // Clear all previously received messages
      for (let u = 0; u < n; u++) {
        const uAttr = graph.getNodeAttributes(`${u}`);
        uAttr[this.#INBOX] = [];
      }

      for (let u = 0; u < n; u++) {
        const uAttr = graph.getNodeAttributes(`${u}`);
        const dist = uAttr[this.#CLUSTERS][level][2];
        if (dist == i) {
          if (uAttr[this.#MESSAGE]) {
            const newColor: [string, string, number] = [uAttr[this.#CLUSTERS][level][1], uAttr[this.#CLUSTERS][level][1], id];
            if (this.#nodeColorChange(this.#nodeColors[u], newColor)) {
              nodeAnimations.push({
                node: u,
                from: this.#nodeColors[u].slice(0, 2),
                to: newColor.slice(0, 2) as any
              });
            }
            
            this.#nodeColors[u] = newColor;

            for (let v of uAttr[NEIGHBORS]) {
              const vAttr = graph.getNodeAttributes(`${v}`);
              if (uAttr[this.#CLUSTERS][level][0] == vAttr[this.#CLUSTERS][level][0]) {
                vAttr[this.#INBOX].push([u, true])
              }
            }
          }
        }
      }

      for (let u = 0; u < n; u++) {
        const uAttr = graph.getNodeAttributes(`${u}`);
        const dist = uAttr[this.#CLUSTERS][level][2];
        if (dist == i + 1) {
          const newColor: [string, string, number] = [uAttr[this.#CLUSTERS][level][1], uAttr[this.#CLUSTERS][level][1], id];
          if (this.#nodeColorChange(this.#nodeColors[u], newColor)) {
            nodeAnimations.push({
              node: u,
              from: this.#nodeColors[u].slice(0, 2),
              to: newColor.slice(0, 2) as any
            });
            this.#nodeColors[u] = newColor;
          }
          if (uAttr[this.#INBOX].length > 0) {
            const message = uAttr[this.#INBOX][Math.floor(Math.random() * uAttr[this.#INBOX].length)];
            const v = message[0];
            const vAttr = graph.getNodeAttributes(`${v}`);
            
            uAttr[this.#MESSAGE] = true;
  
            const newEdgeColor: [number, string, number] = [0, vAttr[this.#CLUSTERS][level][1], id];
            const n1 = Math.min(u, v);
            const n2 = Math.max(u, v);
            if (this.#edgeColorChange(this.#edgeColors[n1][n2], vAttr[this.#CLUSTERS][level][1])) {
              edgeAnimations.push({
                u: n1,
                v: n2,
                from: this.#edgeColors[n1][n2][1],
                to: newEdgeColor[1]
              });
              this.#edgeColors[n1][n2] = newEdgeColor;
            }
          }
        } else {
          const newColor: [string, string, number] = ['white', uAttr[this.#CLUSTERS][level][1], id];
          if (this.#nodeColors[u][2] != id && this.#nodeColorChange(this.#nodeColors[u], newColor)) {
            nodeAnimations.push({
              node: u,
              from: this.#nodeColors[u].slice(0, 2),
              to: newColor.slice(0, 2) as any
            });
            this.#nodeColors[u] = newColor;
          }
        }
        
        uAttr[this.#INBOX] = [];
      }

      const newEdgeColor: [number, string, number] = [0, 'lightgray', id];
      for (let u = 0; u < n; u++) {
        for (let v = u + 1; v < n; v++) {
          if (this.#edgeColors[u][v] && this.#edgeColors[u][v][2] != id && this.#edgeColorChange(this.#edgeColors[u][v], newEdgeColor)) {
            edgeAnimations.push({
              u,
              v,
              from: this.#edgeColors[u][v][1],
              to: newEdgeColor[1]
            });
            this.#edgeColors[u][v] = newEdgeColor;
          }
        }
      }
    }

    return animations;
  }

  #intercast(graph: Graph, level: number): GraphAnimation[] {
    const animations: GraphAnimation[] = [];

    const n = graph.nodes().length;

    const radius = graph.getAttribute(this.#TRUE_RADII)[level];
    const id = Math.random();
    // const id = 1;

    const nodeAnimations: NodeAnimation[] = [];
    const edgeAnimations: EdgeAnimation[] = [];
    const animation: GraphAnimation = {
      state: `Intercast at level ${level}`,
      time: this.#INTERCAST_TIME,
      nodeAnimations,
      edgeAnimations
    };
    animations.push(animation);

    // Clear all previously received messages
    for (let u = 0; u < n; u++) {
      const uAttr = graph.getNodeAttributes(`${u}`);
      uAttr[this.#INBOX] = [];
    }

    // Nodes neighboring other clusters send or listen
    for (let u = 0; u < n; u++) {
      const uAttr = graph.getNodeAttributes(`${u}`);
      const newColor: [string, string, number] = [uAttr[this.#CLUSTERS][level][1], uAttr[this.#CLUSTERS][level][1], id];

      let changed = false;
      for (let v of uAttr[NEIGHBORS]) {
        const vAttr = graph.getNodeAttributes(`${v}`);
        if (uAttr[this.#CLUSTERS][level][0] != vAttr[this.#CLUSTERS][level][0]) {
          if (uAttr[this.#MESSAGE] && !vAttr[this.#MESSAGE]) {
            vAttr[this.#INBOX].push([u, true]);
          }
          if (!changed) {
            changed = true;
            nodeAnimations.push({
              node: u,
              from: this.#nodeColors[u].slice(0, 2),
              to: newColor.slice(0, 2) as any
            });
            this.#nodeColors[u] = newColor;
          }
        }
      }

      if (!changed) {
        const newColor: [string, string, number] = ['white', uAttr[this.#CLUSTERS][level][1], id];
        if (this.#nodeColors[u][2] != id && this.#nodeColorChange(this.#nodeColors[u], newColor)) {
          nodeAnimations.push({
            node: u,
            from: this.#nodeColors[u].slice(0, 2),
            to: newColor.slice(0, 2) as any
          });
          this.#nodeColors[u] = newColor;
        }
      }
    }

    // Send messages along intercluster edges
    for (let u = 0; u < n; u++) {
      const uAttr = graph.getNodeAttributes(`${u}`);
      if (uAttr[this.#INBOX].length > 0) {
        const message = uAttr[this.#INBOX][Math.floor(Math.random() * uAttr[this.#INBOX].length)];
        const v = message[0];
        const vAttr = graph.getNodeAttributes(`${v}`);
        
        uAttr[this.#MESSAGE] = true;

        const newEdgeColor: [number, string, number] = [0, vAttr[this.#CLUSTERS][level][1], id];
        const n1 = Math.min(u, v);
        const n2 = Math.max(u, v);
        if (this.#edgeColorChange(this.#edgeColors[n1][n2], vAttr[this.#CLUSTERS][level][1])) {
          edgeAnimations.push({
            u: n1,
            v: n2,
            from: this.#edgeColors[n1][n2][1],
            to: newEdgeColor[1]
          });
          this.#edgeColors[n1][n2] = newEdgeColor;
        }
      }
      
      uAttr[this.#INBOX] = [];
    }

    const newEdgeColor: [number, string, number] = [0, 'lightgray', id];
    for (let u = 0; u < n; u++) {
      for (let v = u + 1; v < n; v++) {
        if (this.#edgeColors[u][v] && this.#edgeColors[u][v][2] != id && this.#edgeColorChange(this.#edgeColors[u][v], newEdgeColor)) {
          edgeAnimations.push({
            u,
            v,
            from: this.#edgeColors[u][v][1],
            to: newEdgeColor[1]
          });
          this.#edgeColors[u][v] = newEdgeColor;
        }
      }
    }

    return animations;
  }

  #isMessage(value: any): boolean {
    return ![this.#LISTEN, this.#SLEEP].includes(value);
  }

  #nodeColorChange(oldColor: [string, string, number], newColor: [string, string, number]): boolean {
    return oldColor[0] != newColor[0] || oldColor[1] != newColor[1];
  }

  #edgeColorChange(oldColor: [number, string, number], newColor: [number, string, number]): boolean {
    return oldColor[0] != newColor[0] || oldColor[1] != newColor[1];
  }
}
