import * as seedrandom from 'seedrandom';
import { BaseRenderer } from './baseRenderer';
import gsap from 'gsap';
import P5 from 'p5';

const srandom = seedrandom('b');

let noiseMax = 5;
let aoff = 0;

let grad;
let grad2;

export default class P5Renderer implements BaseRenderer{

    colors = ['#4EEC6C', '#FFEB34', '#00A7FF', '#FF6100', '#FF0053'];
    backgroundColor = '#FFFFFF';

    canvas: HTMLCanvasElement;
    s: any;


    completeCallback: any;
    delta = 0;
    animating = true;

    width: number = 1920 / 2;
    height: number = 1080 / 2;

    constructor(w, h) {

        this.width = w;
        this.height = h;

        const sketch = (s) => {
            this.s = s;
            s.setup = () => this.setup(s)
            s.draw = () => this.draw(s)
        }

        new P5(sketch);

    }

    protected setup(s) {
        let renderer = s.createCanvas(this.width, this.height);
        this.canvas = renderer.canvas;

        grad = s.createGraphics(this.width, this.height);
        grad2 = s.createGraphics(this.width, this.height);

        //grad.translate(-s.width / 2, -s.height / 2);

        s.background(0, 0, 0, 255);
    }

    protected draw(s) {

        if (this.animating) {
            this.delta += 1;

            s.blendMode(s.BLEND);
            //s.noTint();
            this.drawGradient(s, grad, 200, 200, 200);
            this.distort(s, grad, 1000, 0.01, this.delta * 1000);
            s.image(grad, 0, 0, s.width, s.height);
            
            
            s.blendMode(s.ADD);
            s.tint(255, 50, 200, 100); // Display at half opacity
            this.drawGradient(s, grad2, 255, 255, 255);
            this.distort(s, grad2, 1000, 0.01, 0);
            s.translate(s.width, s.height);
            s.rotate(s.radians(180));
            s.image(grad2, 0, 0, s.width, s.height);
            

        }

    }

    protected drawGradient(s, sourceImage, r, g, b) {

        let x = 0;
        let y = 0;
        let w = this.width;
        let h = this.height;
        let c1, c2, c3;
        c1 = s.color(r, g, 0);
        c2 = s.color(0, g, 0);
        c3 = s.color(0, g, b);
        let c;
        let inter;

        for (let i = x; i <= x + w; i++) {
            if (i < (x + w) / 2) {
                inter = s.map(i, x, x + (w / 2), 0, 1);
                c = s.lerpColor(c1, c2, inter);
            } else {
                inter = s.map(i, x + (w / 2), x + w, 0, 1);
                c = s.lerpColor(c2, c3, inter);
            }
            sourceImage.stroke(c);
            sourceImage.line(i, y, i, y + h);
        }

    }

    protected distort(s, sourceImage, amount, scale, delta){
        let vectorField = [];
        //var amount = 1000;
        //var scale = 0.01;

        sourceImage.loadPixels();

        for (let x = 0; x < sourceImage.width; x++){
          let row = [];
          for (let y = 0; y < sourceImage.height; y++){
            let _xoffset;
            let _yoffset;
            if (delta > 0) {
                _xoffset = amount*(s.noise(scale*x,scale*y * 0.5*delta)-0.5);
                _yoffset = 4*amount*(s.noise((100+scale*x*delta),(scale*y * 0.5))-0.5);
            } else {
                _xoffset = amount*(s.noise(scale*x,scale*y * 0.5)-0.5);
                _yoffset = 4*amount*(s.noise((100+scale*x + this.delta),(scale*y * 0.5))-0.5);
            }

            let vector = s.createVector(_xoffset, _yoffset);
            row.push(vector);
          }
          vectorField.push(row);
        }
      
        let result = [];
        for (let j = 0; j < sourceImage.height; j++) {
            for (let i = 0; i < sourceImage.width; i++) {

            let res = vectorField[i][j];

            let ii = s.constrain(s.floor(i + res.x), 0, sourceImage.width - 1);
            let jj = s.constrain(s.floor(j + res.y), 0, sourceImage.height - 1);

            let source_i = (jj * sourceImage.width + ii) * 4;
            let col = s.color(
                sourceImage.pixels[source_i],
                sourceImage.pixels[source_i + 1],
                sourceImage.pixels[source_i + 2],
                sourceImage.pixels[source_i + 3]);

            result.push(col);
            }
        }

        for(let m = 0; m < sourceImage.height; m++) {
            for (let n = 0; n < sourceImage.width; n++) {

                let result_i = m * sourceImage.width + n;
                let target_i = result_i * 4;

                let col = result[result_i];
                sourceImage.pixels[target_i]     = s.red(col);
                sourceImage.pixels[target_i + 1] = s.green(col);
                sourceImage.pixels[target_i + 2] = s.blue(col);
                sourceImage.pixels[target_i + 3] = s.alpha(col);
            }
        }

        sourceImage.updatePixels(0, 0, this.width, this.height);
    }

    public render() {

    }

    public play() {
        this.animating = true;
        setTimeout(() => {
            console.log('go');
            if (this.completeCallback) {
                this.completeCallback();
            }
        }, 10000);
    }

    public stop() {
        this.animating = false;
    }

    public setCompleteCallback(completeCallback: any) {
        this.completeCallback = completeCallback;
    }

    public resize() {
        this.s.resizeCanvas(window.innerWidth, window.innerHeight);
        this.s.background(0, 0, 0, 255);
    }
}