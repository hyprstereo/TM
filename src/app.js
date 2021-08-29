/**
 *
 *  ████████╗███╗   ███╗     ██████╗ ███╗   ██╗███████╗    ███████╗██╗  ██╗██████╗
 *  ╚══██╔══╝████╗ ████║    ██╔═══██╗████╗  ██║██╔════╝    ██╔════╝╚██╗██╔╝██╔══██╗
 *     ██║   ██╔████╔██║    ██║   ██║██╔██╗ ██║█████╗      █████╗   ╚███╔╝ ██████╔╝
 *     ██║   ██║╚██╔╝██║    ██║   ██║██║╚██╗██║██╔══╝      ██╔══╝   ██╔██╗ ██╔══██╗
 *     ██║   ██║ ╚═╝ ██║    ╚██████╔╝██║ ╚████║███████╗    ███████╗██╔╝ ██╗██║  ██║
 *     ╚═╝   ╚═╝     ╚═╝     ╚═════╝ ╚═╝  ╚═══╝╚══════╝    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
 *
 *
 */

import { SceneManager } from "./controllers/view.js";
import { GlobalProps, setupScreens } from "./scene/props.js";
import { TOMIController } from "./controllers/tomi/tomi.controller.js";
import { HTMLFrame, HTMLLayer, IOCScene } from "./scene/ioc.js";
import * as THREE from '/build/three.module.js'
import { createVideoElement } from "./interact/pano.js";
import { Indicator, Pointer3D } from "./interact/pointer.js";
import { SpriteButton, SpriteLayer } from "./objects/sprites.js";
import { setupEditor } from "./interact/ui.js";
import Stats from "./build/stats.module.js";
import { degToRad } from "./utils/helpers.js";
import { ActionProps, showProps } from "./utils/tester.js";
import { AnimaxTimeline } from "./controllers/anim.controller.js";
import { createOverlay } from "./controllers/tomi/tomi.overlay.js";
import { setupAudio } from "./controllers/tomi/tomi.audio.js";
import { setupFacial } from "./controllers/tomi/tomi.facial.js";
import { setupTOMIAnimator } from "./controllers/tomi/tomi.animator.js";
import { GUIPanelRenderer } from "./utils/guipanel.renderer.js";
import { createSpiderGame } from "./interact/web.game.js";

const data = `[{"x":2.7278134036195496, "y": 1.183559422099973, "z": -3.2312832293855966},{"_x":-2.966433655861033,"_y":0.03200187598513606,"_z":3.135930225859582,"_order":"XYZ"}]`
export const SceneConfig = {
  startPos: { x: 0, y: 0, z: 0 },
  tomiInitialPosition: new THREE.Vector3(2.786939482308075, 1.28, 0.3),
  terminalPosition: { x: 2.7278134036195496, y: 1.183559422099973, z: -3.2312832293855966 },
  terminalQuaternion: { "_x": -2.966433655861033, "_y": 0.03200187598513606, "_z": 3.135930225859582, "_order": "XYZ" },
  Assets: {
    Audio: {
      ioc: [
        '/cm_audio/0_Benefits01NEW.mp3',
        '/cm_audio/0_BenefitsAgility.mp3',
        '/cm_audio/0_BenefitsCompetitive.mp3',
        '/cm_audio/0_BenefitsCost.mp3',
      ],
      cyber: ['/cm_audio/0_BenefitsSecurity.mp3']
    },
    Video: [

    ],
    Models: [
      "/models/ioc/building2.glb",
      "/models/ioc/tables.glb",
      "/models/ioc/screens.gltf",
      "/models/tomi/tomi-base-4.glb",
      "/models/tomi/tomi-4.glb",
      "/models/tomi/tomi_4.0.1.glb",
      "/models/tomi/tomi_4.0.2.glb",
    ]
  }
}
const iocScene = new IOCScene(SceneManager);
iocScene.configureMediaManager();
SceneManager.ioc = iocScene;
const animax = new AnimaxTimeline();

let pointer, indicator;
const _debug = {
  stats: null,
  panel: null,
  mode: false
};
let autoplayTM;
const ledSideT = new THREE.TextureLoader().load('/ui/ioc/screen/A13.jpg');
ledSideT.flipY = false;
const ledSide = new THREE.MeshBasicMaterial({ map: ledSideT })
const ledMats = [];
let master = gsap.timeline();
let avg;
let gui;
const init = async () => {
  let htmlEl;

  // configure UI
  if (_debug.mode) {
    setupEditor(null);
    _debug.stats = new Stats();
    _debug.stats.showPanel(0);
    document.body.appendChild(_debug.stats.dom);
  }

  window.loadProgress = ({ loaded, total }) => {
    console.log(`progress`, loaded, total)
  };
  const build = await SceneManager.setup("#app").then((r) => r);
  const outline = build.composer.outline;
  indicator = Indicator();
  build.scene.add(indicator);

  let id = 0;

  SceneManager.on("loadbegin", (e) => console.log("begin", e));
  //SceneManager.on("loadprogress", (e) => console.log("progress", e));
  SceneManager.on("loadcomplete", (e) => {
    //SceneManager.camera.updateMatrixWorld();
    let model = e.scene || e;
    if (id == 1) {
      SceneManager.scene.add(model);
      setupScreens(model, SceneManager.scene);
    } else if (id == 3) {
      SceneManager.tomi = new TOMIController(e, 1, SceneManager);
      SceneManager.tomi.use(setupFacial, setupTOMIAnimator, setupAudio, createOverlay, ActionProps);

      SceneManager.scene.add(SceneManager.tomi);
      SceneManager.tomi.position.set(
        SceneConfig.tomiInitialPosition.x,
        SceneConfig.tomiInitialPosition.y,
        SceneConfig.tomiInitialPosition.z);
      SceneManager.tomi.saveState();
      // SceneManager.tomi.mesh.position.set(0, 1, 0);
    } else if (id >= 4) {

      SceneManager.tomi.loadTracks(e, SceneConfig.Assets.Models[id]);
    } else {
      let videoSource = ['/video/map.mp4', '/video/fortinet.mp4', '/video/deco.mp4'];
      model.traverse(node => {

        if (node.type === 'Mesh') {
          if (node.name.startsWith('building003')) {
            node.visible = false;
          } else if (node.name.startsWith('led')) {
            node.layers.set(6);
            
            iocScene.screenManager.addTarget(node.name, node, videoSource.shift(), true).then((a)=>{
              console.log(a)
            });
            //TODO: remove _leds
            iocScene._leds.push(node);
            //ledMats.push(node);
          }
          node.castShadow = false;
          node.receiveShadow = false;
        }
      });
      SceneManager.scene.add(model);
    }
   
    id++;
    console.log("complete", model);

  });

  SceneManager.on('beforeRender', (delta = 0) => {
    if (_debug.mode) _debug.stats.begin();
    animax.update(delta);
    SceneManager.renderer.clear();
    if (SceneManager.tomi.updateReflect && !SceneManager.done) {
      SceneManager.tomi.updateReflect();
      SceneManager.done = true;

    }
  })

  SceneManager.on('afterRender', (delta = 0) => {
    if (_debug.mode) _debug.stats.end();
    // if (gui) {
    //   SceneManager.renderer.clearDepth();
    //   gui.onRender(delta);
    //   console.log('gui', delta);

    // }
  })

  SceneManager.on("loadfinished", async () => {
    SceneManager.ioc.screenManager.addTarget('monitor', GlobalProps.Monitor, '/video/pano.mp4');
    GlobalProps.Monitor.material.needsUpdate = true;
    //iocScene.screenManager.playFrom('monitor', 3);

    window.addEventListener('resize', SceneManager._onResize.bind(SceneManager), false)
    iocScene.createFX(SceneManager.scene, SceneConfig);
    const list = await iocScene.loadVideoList();
    if (!list) {
      console.warn('video playlist is not available');
    }
    // create the content layer
    SceneManager.tomi.sortAnimationClips()

    _debug.panel = showProps(SceneManager.tomi, SceneManager, animax);
    animax.setElement();
    if (!_debug.mode) {
      _debug.panel.hide()
    }
    SceneManager.tomi.play(1, THREE.LoopRepeat);
    SceneManager.tomi.rotateY(degToRad(180));


    const content = await iocScene.create(SceneManager.scene, SceneConfig).then(obj => obj);
    SceneManager.scene.add(content);

    pointer = new Pointer3D(build.camera, build.scene, build.renderer.domElement, null, SpriteLayer, outline, true);
    iocScene.bindPointer(pointer);
    const btnPos = new THREE.Vector3(SceneConfig.terminalPosition.x, SceneConfig.terminalPosition.y + .3, SceneConfig.terminalPosition.z + 2);
    content.position.copy(btnPos);
    content.children[0].rotateY(degToRad(90));

    // SceneManager.scene.onUpdate = function() {
    //     rendr.render(scene, this.sceneManager.camera);
    // }

    pointer.on('pointertouch', ({ pos, objects }) => {
      if (objects.length) {
        const sel = objects[0];
        console.log('down', sel);

      }
    });

    pointer.on('pointerup', ({ pos, objects }) => {
      if (objects.length <= 0)
        return
      if (objects[0].object instanceof SpriteButton) {
        const sel = objects[0].object;
        const data = sel.userData || {};

        switch (data.content) {
          case 'move':
            SceneManager.controls.target = sel.userData.target;
            const p = SceneManager.tomi.position.clone();
            p.y = SceneManager.tomi.position.y + SceneManager.tomi.mesh.position.y;
            //SceneManager.controls.target = p;
            SceneManager.controls.moveTo(new THREE.Vector3(sel.userData.position.x, SceneConfig.terminalPosition.y, sel.position.z), 0, () => {
              const cpos = SceneManager.camera.position.clone();
              cpos.z += 0.01;
              SceneManager.controls.target = cpos;
              SceneManager.controls.enablePan = false;
              SceneManager.controls.enableZoom = true;
              iocScene.state = 1;
            });
            break;
          case 'ioc':
            iocScene.state = 2;
            break
          case 'cyber':
            iocScene.state = 3;
            break
          case 'next':

            iocScene.nextVideo();
            iocScene.Button(3).hide();
            break;
          case 'restart':
            iocScene.state = 1;
            iocScene.Button(3).hide();
            break;
          default:
            if (data.activate) {
              data.activate();
            }
            break;
        }
      }
    });

    iocScene.on('videoended', (e) => {
      if (!iocScene.endOfList()) {
        if (!iocScene.guides.next) {
          SceneManager.controls.lookAt(iocScene.Button(3).position, true);
          iocScene.guides.next = true;
        }
        iocScene.Button(3).show();
      } else {
        iocScene.Button(4).show();
      }

    })

    iocScene.on('newplaylist', (e) => {
      iocScene.Button(3).hide();
      iocScene.Button(4).hide();
    });
    iocScene.on('play', function(e) {
      if (!SceneManager.tomi.analyser) SceneManager.tomi.setupAnalyzer(e.target);
      SceneManager.tomi.selfAware(true);
    })

    let lastFX = 'alarm';
    iocScene.on('onmediastart', (video, audio, set, index, data) => {
      const tomiConf = data.tomi || {visible: true};
      if (tomiConf) {
        if (!tomiConf.specials) {

         // iocScene.mainLED(iocScene.screenTexture());
        }
        if (tomiConf.visible) {
          SceneManager.tomi.appear();
        } else {
          SceneManager.tomi.disappear();
        }
        if (tomiConf.position) {
          const p = tomiConf.position;
          const newp = new THREE.Vector3(
            SceneConfig.tomiInitialPosition.x + p.x,
            SceneConfig.tomiInitialPosition.y + p.y,
            SceneConfig.tomiInitialPosition.z + p.z);
          const camPos = SceneManager.camera.position.clone();
          SceneManager.controls.enableRotate = false;
          SceneManager.tomi.moveTo(newp, true, SceneManager.camera, 'mid', (pos) => {
            //s SceneManager.controls.target = pos;
          }, () => {

            SceneManager.controls.enableRotate = true;
          });
        }
      }


      if (set === 'cyber') {
        if (lastFX != '') iocScene.FX(lastFX).deactivate();

        switch (index) {
          case 0:
            SceneManager.tomi._defaultClip = 1;
            SceneManager.tomi.play(1);
            SceneManager.tomi.face.reset();

            break
          case 1:

            // SceneManager.tomi.playSound('/video/cyber/audio/C02.mp3', false);
            SceneManager.tomi.face.useAudio = false;
            iocScene.FX('alarm').activate();
            lastFX = 'alarm';

            break;
          case 6:
            SceneManager.tomi.face.useAudio = true;
            setTimeout(_ => {
              iocScene.FX('boss').activate();
              lastFX = 'boss';
            }, 2000);

            break;
          default:
            SceneManager.tomi.face.useAudio = true;

            iocScene.nextVideo().mainLED();
            break;
        }
      } else if (set === 'ioc') {
        //SceneManager.tomi.face.useAudio = true;

        //SceneManager.tomi.showOverlay(false);
        switch (index) {
          case 3:

            //SceneManager.tomi.addIcon('alarm');
            master = SceneManager.tomi.showSets('alarm maintainence escalator thumbsup', video.duration / 4);
            break;
          case 4:

            avg = video.duration / 3;

            if (master) master.clear();
            master = SceneManager.tomi.showSets('cctv communicate support cctv2', avg, avg, 0);
            break;
          case 5:

            avg = video.duration / 3;
            master = SceneManager.tomi.showSets('traffic wireless support cars', avg, avg, avg, 0);
            break;
          case 7:

            master = SceneManager.tomi.showSets('call escalator light', 0);
            break;
          case 8:
            master = SceneManager.tomi.showSets('temphot maintainence support tempcold', 0);
            // case 9:
            //   master = SceneManager.tomi.showSets('complain maintanence support thumbsup', 0);
            break;

          default:
            SceneManager.tomi.showSets('');
            //if (master.paused()) {
            //master.resume();
            //}
            break;
        }

      }
    })

    iocScene.on('videoloaded', ({ event, video }) => {
      console.log(event, video);
    })

    iocScene.on('statechange', (state) => {

      console.log(state);
      switch (state) {
        case 2:
          iocScene.setCurrentPlaylist('ioc');
          SceneManager.tomi.play(1);
          SceneManager.tomi.face.reset();
          setTimeout(_ => {
            iocScene.nextVideo().mainLED();
          }, 800);


          break;
        case 3:
          iocScene.setCurrentPlaylist('cyber');
          setTimeout(_ => {
            SceneManager.tomi.play(1);
            SceneManager.tomi.face.reset();
            setTimeout(_ => {
              iocScene.nextVideo().mainLED();
            }, 800);
          }, 800);

          break;
        // case 1:
        //   setTimeout(_ => {
        //     SceneManager.tomi.disappear();
        //     iocScene.resetVideo();
        //   }, 800);
        //   break;
        default:
          SceneManager.tomi.disappear();
          iocScene.resetVideo();


          break;
      }
    })

    //setupVideoPanel();

    SceneManager.tomi.disappear();
    // start the scene
    SceneManager.play();
    const campos = SceneManager.camera.position.clone();
    campos.z += 0.01;
    SceneManager.controls.target = campos;
    // SceneManager.tomi.saveState();


    gsap.to(
      '#loading-screen',
      1,
      {
        opacity: 0,
      });

    // starting position
    SceneManager.camera.layers.enableAll();
    const pos = new THREE.Vector3(0, SceneConfig.terminalPosition.y, SceneConfig.terminalPosition.z);
    SceneManager.tomi.position.z -= 0.5;
    //SceneManager.controls.lookAt(pos);
    SceneManager.controls.screenSpacePanning = true;
    SceneManager.camera.position.set(0, SceneConfig.terminalPosition.y + .01, -3)
    SceneManager.camera.layers.toggle(7);
    iocScene.screenManager.playAll();
  });

  SceneManager
    .loadAssets(SceneConfig.Assets.Models)
    .then((completed) => {
      res(completed);
    });
};

const setupVideoPanel = async (mat, src = '/video/fortinet.mp4') => {
  const videoEl = await createVideoElement({ preload: true, autoplay: true }, src).then(v => v);
  document.body.appendChild(videoEl);
  const videoTexture = new THREE.VideoTexture(videoEl);
  videoTexture.flipY = false;
  mat.map = videoTexture;
  videoEl.play();

  return videoEl;
}

document.body.onload = async (evt) => {
  await init();

  window.addEventListener('keydown', (e) => {
    if (e.key == 't') {
      iocScene.FX('alarm').activate();
    } else if (e.key == 'i') {
      iocScene.reset();
    } else if (e.key == 'p') {
      //const a = JSON.stringify([SceneManager.camera.position, SceneManager.camera.rotation]);
      const i = (Math.random() * SceneManager.tomi._waypoints.length);
      SceneManager.tomi.moveTo(SceneManager.tomi._waypoints[i]);
      console.log(SceneManager.tomi._waypoints);
    } else if (e.key === 'x') {
      if (SceneManager.tomi.overlayGroup.visible) {
        SceneManager.tomi.showOverlay(false);
      } else {
        SceneManager.tomi.showOverlay(true);
      }
    } else if (e.key === 'y') {
      //
      SceneManager.camera.layers.toggle(7);
      console.log(SceneManager);

      // speech.speak(text)
    } else if (e.key === 'z') {
      console.log(SceneManager.camera.position);

    } else if (e.key == 'u') {
      iocScene.nextVideo();
    } else if (e.key == 'h' && e.shiftKey) {
      if (!_debug.mode) {
        _debug.mode = true;
        _debug.stats.dom.style.display = 'visible'
        _debug.stats.showPanel(0)
      } else {
        _debug.mode = false;
        _debug.stats.dom.style.display = 'none'
        _debug.panel.close();
      }
    }
  });
};