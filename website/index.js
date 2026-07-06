import { init as initParticles, nextShape, prevShape } from './assets/js/particles.js?v=1.0.1';
import { initScrollLogic } from './assets/js/scroll.js?v=1.0.1';
import { UI } from './assets/js/ui.js?v=1.0.1';

window.scrollTo(0, 0);

const canvas = document.getElementById('webglCanvas');
let system = { camera: null, controls: null };

if (canvas) {
    system = initParticles();
}

const ui = new UI(
    () => {
        if (!canvas) return;
        ui.setDisabled(true);
        nextShape().then((shape) => {
            if (shape) ui.updateText(shape.title, shape.description);
        }).finally(() => {
            ui.setDisabled(false);
        });
    },
    () => {
        if (!canvas) return;
        ui.setDisabled(true);
        prevShape().then((shape) => {
            if (shape) ui.updateText(shape.title, shape.description);
        }).finally(() => {
            ui.setDisabled(false);
        });
    }
);

if (canvas) {
    initScrollLogic(system.camera, system.controls, canvas);
}


console.log(`%c
      |\\      _,,,---,,_
ZZZzz /, \`.-'\`'    -.  ;-;;,_
     |,4-  ) )-,_. ,\\ (  \`'-'
    '---''(_/--'  \`-'\\_) 

       WELCOME TO CODICRAFT
`, "font-family: monospace; color: #38bdf8; font-size: 14px; font-weight: bold;");
