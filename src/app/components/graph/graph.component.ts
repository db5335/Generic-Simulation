import { Component, Inject, OnInit } from '@angular/core';
import Graph from 'graphology';
import Sigma from 'sigma';
import { AnimationService } from 'src/app/services/animation.service';
import { GraphLevel } from 'src/app/models/graph-level';
import { AlgorithmService } from 'src/app/services/algorithm.service';
import { GraphService } from 'src/app/services/graph.service';
import { NgModel } from '@angular/forms';
import { NodeBorderProgram, createNodeBorderProgram } from '@sigma/node-border';
import { GraphAnimation } from 'src/app/models/graph-animation';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {
  
  readonly DEFAULT_NUMBER_OF_NODES = 256;
  // readonly DEFAULT_NUMBER_OF_NODES = 256;
  // readonly DEFAULT_NUMBER_OF_NODES = 100;
  // readonly DEFAULT_NUMBER_OF_NODES = 25;

  numberOfNodes = this.DEFAULT_NUMBER_OF_NODES;
  graph!: Graph;
  topLevel!: GraphLevel;
  radius: number = 1;
  state?: string;

  animations: GraphAnimation[] = [];

  constructor(
    private _algorithmService: AlgorithmService,
    private _animationService: AnimationService,
    private _graphService: GraphService
  ) {
    // Empty constructor
  }
  
  ngOnInit(): void {
    this.graph = new Graph();
    this.topLevel = this._graphService.generateGraph(this.graph, this.numberOfNodes);
    this._algorithmService.bfs(this.graph);
    this.animations = this._algorithmService.buildClusters(this.graph, this.radius);
    this._animationService.state.subscribe((value) => this.state = value);
    this._animationService.update(this.graph, this.animations);
    this._animationService.animate();

    const sigmaInstance = new Sigma(this.graph, document.getElementById("graph")!, {
      defaultNodeType: "border",
      nodeProgramClasses: {
        border: createNodeBorderProgram({
          borders: [
            { size: { attribute: "borderSize", defaultValue: 0.2 }, color: { attribute: "borderColor" } },
            { size: { fill: true }, color: { attribute: "color" } },
          ],
        }),
      },
    });
  }

  generate(n: number): void {
    this.graph.clear();
    this.topLevel = this._graphService.generateGraph(this.graph, this.numberOfNodes);
    const s = this._algorithmService.buildClusters(this.graph, n);
    // this._animationService.animate(this.topLevel.graph, s);
  }
  
  goTo(n: number): void {
    this.radius = n;
    this._animationService.goTo(n);
  }

  play(): void {
    this._animationService.animate();
  }
}
