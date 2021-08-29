import * as THREE from "/build/three.module.js";
import * as dat from '../build/dat.gui.module.js';
import { ActionSet } from "../controllers/tomi/tomi.controller.js";


export const TomiPositions = {
    pos: []
}
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
            ctx.playAction(new ActionSet(21), false);
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
}

export const TomiProp = {
    StartingPos: new THREE.Vector3(0, 0, 0),
    face: {
        eyesIndex: 0,
        defaultLipIndex: 0,
        talking: true,
    },
    Animation: {
        clip: '',
        loop: THREE.LoopOnce,
        loopCount: 0,
        blendTime: 0.8,
    }
}

const TOMIProps = {
    Face: {
        eyeIndex: 0,
        lipIndex: 0
    },
    Actions: null,
    Animations: {
        loop: THREE.LoopOnce,
        currentClip: '',
        load: () => {

        }
    }
}
export const createGUIProp = (target, props = {}, title = undefined, animax = undefined) => {
    const gui = new dat.gui.GUI();
    if (!title) title = target.constructor.name;
    gui.addFolder(title);
    let currFolder = gui;
    const face = gui.addFolder('Facial Control');
    face.addF
}

let guiProp = {
    state: false,
    started: false,
}
export const showProps = (target, sceneManager, animax = undefined) => {
    const tomi = target;
    let animClips = [];
    const reload = () => {
        animClips = []
        tomi._clips.forEach((n, i) => {
            animClips.push(`[${i}] ${n.name}`);
        });
        return animClips;
    }

    const TOMIAnims = {
        recording: false,
        time: sceneManager.clock.getElapsedTime(),
        actions: gsap.timeline(),
        play: () => {

            if (!TOMIAnims.recording) {
                animax.tl = TOMIAnims.actions;
            }
            sceneManager.ioc.replay();
        },
        reset: () => {
            TOMIAnims.actions = gsap.timeline({ repeat: 0 });
            TOMIAnims.time = sceneManager.clock.getElapsedTime()
        },
        save: () => {
            animax.tl.stop();
            animax.tl = TOMIAnims.actions;
        },
        actionTrigger: (propName) => {
            if (TOMIAnims.recording && animax) {
                TOMIAnims.actions.add(tomi.actions(propName), animax.time);
                console.log(propName);
                //TOMIAnims.actions.add(tomi.actions(propName), elapse);

            }
        }
    }

    const faceProps = {
        mouthIndex: 0,
        eyesIndex: 0,
        ...tomi._actions,
    }


    const gui = new dat.gui.GUI();
    const te_group = gui.addFolder('Tomi')

    te_group.add(TOMIAnims, 'recording').name('Record').onChange(v => {
        animax.recording = v;
    });
    te_group.add(TOMIAnims, 'play').name('Play');
    te_group.add(TOMIAnims, 'reset').name('Reset');
    te_group.add(TOMIAnims, 'save').name('Save');

    const face_group = gui.addFolder('Face')

    const mouthCtl = face_group.add(faceProps, 'mouthIndex', 0, tomi.face.lips.length - 1).step(1)
    mouthCtl.onChange((value) => {
        tomi.face.setLip(value);
    })
    const eyeshCtl = face_group.add(faceProps, 'eyesIndex', 0, tomi.face.eyes.length - 1).step(1)
    eyeshCtl.onChange((value) => {
        tomi.face.setEyes(value, value);
    })
    face_group.open()

    // face_group.add(this.face, 'talking').onChange(value => {
    //   mouthCtl.enabled = !value;
    // });
    const actionGroup = gui.addFolder('Actions')
    actionGroup.open();
    actionGroup.add(faceProps, 'greeting').name('Greet');
    actionGroup.add(faceProps, 'talkAction').name('Talk');
    actionGroup.add(faceProps, 'talkAction2').name('Talk #2');
    actionGroup.add(faceProps, 'talkAction3').name('Talk #3');
    actionGroup.add(faceProps, 'talkAction4').name('Talk #4');
    actionGroup.add(faceProps, 'thinking').name('Thinking');
    actionGroup.add(faceProps, 'eureka').name('Eureka');
    actionGroup.add(faceProps, 'sigh').name('Sigh');
    actionGroup.add(faceProps, 'grin').name('Grin');
    actionGroup.add(faceProps, 'error').name('Error');
    actionGroup.add(faceProps, 'wink').name('Wink');
    actionGroup.add(faceProps, 'blink').name('Blink');
    actionGroup.add(faceProps, 'serious').name('Serious');


    const anim_group = gui.addFolder('Animations');

    let clipper;
    const lp = { Once: THREE.LoopOnce, Repeat: THREE.LoopRepeat, PingPong: THREE.LoopPingPong }
    const AnimProp = {
        loop: lp.Once,
        clips: animClips,
        currentClip: '',
        reload: () => {
            AnimProp.clips = reload();
            if (clipper) clipper.remove();
            clipper = anim_group.add(AnimProp, 'currentClip', AnimProp.clips).onChange(value => {
                const animName = value.split('] ')[1];
                tomi.play(animName, AnimProp.loop);
            });
        },
        upload: () => setupUpload(AnimProp.reload),

    }
    anim_group.add(AnimProp, 'loop', ['Once', 'Repeat', 'PingPong']).onChange(v => {
        AnimProp.loop = lp[v];
    });

    AnimProp.reload();

    anim_group.add(AnimProp, 'upload', 'Upload');



    return gui;
}