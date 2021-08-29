import * as THREE from "/build/three.module.130.js";

export const ActionProps = (ctx) => {

    const actions = {
        running: false,
        greeting: () => {
            ctx.face.action(3, 3, 0, 1000);
            ctx.play(0);
        },
        wink: () => {
            ctx.face.action(8, face._eyeRight, -1, 250);
        },
        blink: () => {
            ctx.face.action(9, 9, -1, 100);
        },
        grin: () => {
            ctx.face.action(3, -1, -1, 2000);
        },
        reset: () => {
            ctx._defaultClip = 1;
            ctx.face.reset();
        },
        error: () => {

            const p = ctx.root.position.clone();
            p.x = ctx.position.x;
            let t = setInterval(_ => {
                p.y = ctx.root.position.y + 1.78;
                ctx.sceneManager.controls.lookAt(p);
            }, 25)

            ctx.face.action(10, -1, 7, 0);
            ctx._defaultClip = 19;
            ctx.play(23, THREE.LoopOnce, 0, () => {
                console.log('error end');

                setTimeout(_ => {
                    ctx._defaultClip = 12;
                    ctx.play(20, THREE.LoopOnce, 0, () => {
                        ctx._defaultClip = 1;
                    });
                }, 10000);
                if (t) {
                    clearInterval(t);
                    t = null;
                }
                const pp = ctx.position.clone()
                pp.y = 1.48;
                ctx.sceneManager.controls.lookAt(pp);
                const cpos = ctx.sceneManager.camera.position.clone();
                cpos.z += 0.01;
                ctx.sceneManager.controls.c.target = cpos;


            });

        },
        sigh: () => {
            ctx.play(25);
            ctx.face.action(9, -1, 6, 2000);
        },
        serious: (d = 3000) => {
            ctx.play(18, THREE.LoopRepeat, 5);
            ctx.face.action(6, -1, 1, d);
        },
        thinking: () => {
            ctx.play(21, THREE.LoopOnce, 0);
            ctx.face.action(9, -1, 0, 1000);
        },
        eureka: () => {
            ctx.play(22, THREE.LoopOnce, 0);
            ctx.face.action(5, -1, 5, 1200);
        },
        talkAction: (index = 14) => {
            ctx.play(index);
        },
        talkAction2: () => {
            ctx.face.action(3, -1, -1, 2000);
            ctx.play(15);
        },
        talkAction3: () => {
            ctx.face.action(5, -1, -1, 2000);
            ctx.play(16);
        },
        talkAction4: () => {
            ctx.face.action(4, -1, -1, 2000);
            ctx.play(17);
        }

    }
    ctx.defineActions(actions);
};

const defaultActionList = ["talkAction", "talkAction2", "talkAction3", "talkAction4", "eureka", "thinking", "sigh"];
export const setupTOMIAnimator = (tomi) => {
    const self = tomi;
    let awareId = null;
    self.autoAnimate = true;
    const selfAware = (state) => {

        if (!state) {
            if (awareId) {
                clearInterval(awareId);
                awareId = null;
            }
        } else {
            if (awareId) {
                clearInterval(awareId);
                awareId = null;
            }
            awareId = setInterval(_ => {
                const list = defaultActionList;
                const id = Math.min(Math.round(Math.random() * list.length), list.length - 1);
                self.actions(list[id])();
            }, 1500);

        }
    }
    self.selfAware = selfAware;
}