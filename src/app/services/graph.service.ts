import { Injectable } from '@angular/core';
import Graph from 'graphology';
import { GraphLevel } from '../models/graph-level';
import { Delaunay } from 'd3';
import { countConnectedComponents } from 'graphology-components';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  readonly DEFAULT_WIDTH = 1000;
  readonly DEFAULT_THICKNESS = 8;
  // readonly DEFAULT_HEIGHT = 900;

  constructor() { }

  generateGraph(graph: Graph, numberOfNodes: number): GraphLevel {
    graph.clear();

    let arr = [];

    for (let i = 0; i < numberOfNodes; i++) {
      // let x = this.DEFAULT_WIDTH * Math.random();
      // let y = this.DEFAULT_WIDTH * Math.random();
      let x = this.DEFAULT_WIDTH * (i % Math.sqrt(numberOfNodes))
      let y = this.DEFAULT_WIDTH * Math.floor(i / Math.sqrt(numberOfNodes));
      if (Math.floor(i / Math.sqrt(numberOfNodes)) % 2 == 0) {
        x = this.DEFAULT_WIDTH * (Math.sqrt(numberOfNodes) - 1) - x;
      }

      x = this.DEFAULT_WIDTH * (i % (numberOfNodes / this.DEFAULT_THICKNESS))
      y = this.DEFAULT_WIDTH * Math.floor(i / (numberOfNodes / this.DEFAULT_THICKNESS))

      // if ((x - this.DEFAULT_WIDTH / 2) ** 2 + (y - this.DEFAULT_WIDTH / 2) ** 2 > (this.DEFAULT_WIDTH / 2) ** 2) {
      //   i--;
      //   continue;
      // }

      arr.push([x, y]);
      // graph.addNode(`${i}`, { label: `${i}`, x, y, size: 10 });
      graph.addNode(`${i}`, {x, y, size: 10 });
    }

    const triangulation = new Delaunay(arr.flat());

    const edges = [];

    for (let i = 0; i < numberOfNodes - 1; i++) {
      const j = i + 1;
      if (j % (numberOfNodes / this.DEFAULT_THICKNESS) != 0) {
        graph.addEdge(`${i}`, `${j}`, { color: 'lightgray', size: 5 });
        graph.updateNodeAttribute(`${i}`, 'neighbors', n => {
          let a = n ?? [];
          a.push(j);
          return a;
        });
        graph.updateNodeAttribute(`${j}`, 'neighbors', n => {
          let a = n ?? [];
          a.push(i);
          return a;
        });
      }

      const k = numberOfNodes / this.DEFAULT_THICKNESS + i;
      if (k < numberOfNodes) {
        graph.addEdge(`${i}`, `${k}`, { color: 'lightgray', size: 5 });
        graph.updateNodeAttribute(`${i}`, 'neighbors', n => {
          let a = n ?? [];
          a.push(k);
          return a;
        });
        graph.updateNodeAttribute(`${k}`, 'neighbors', n => {
          let a = n ?? [];
          a.push(i);
          return a;
        });
      }
    }

    return {
      graph,
      adjacencies: triangulation
    }
  }
}
