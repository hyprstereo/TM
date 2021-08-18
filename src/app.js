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

import { createLoadScreen, loadAsset, sceneResize } from "./controllers/ioc.js";
import { SceneManager } from "./controllers/view.js";
import { GlobalProps, setupScreens } from "./scene/props.js";
import { TOMIController, TomiFace } from "./controllers/tomi/tomi.controller.js";
import { IOCScene } from "./scene/ioc.js";
import * as THREE from '/build/three.module.js'
import { createVideoElement } from "./interact/pano.js";
import { Pointer3D } from "./interact/pointer.js";
import { SpriteButton, SpriteLayer } from "./objects/sprites.js";
import { TTS } from "./utils/tts.js";
import { EditMode, setupEditor } from "./interact/ui.js";
import Stats from "./build/stats.module.js";
import { degToRad } from "./utils/helpers.js";
import { ActionProps, createGUIProp, showProps, TomiPositions, TomiProp } from "./scene/debug.js";
import { AnimaxTimeline } from "./controllers/anim.controller.js";
import { MeshBasicMaterial, Scene } from "./build/three.module.js";

const data = `[{"x":2.7278134036195496, "y": 1.183559422099973, "z": -3.2312832293855966},{"_x":-2.966433655861033,"_y":0.03200187598513606,"_z":3.135930225859582,"_order":"XYZ"}]`
export const SceneConfig = {
  StartPos: { x: 0, y: 0, z: 0 },
  TomiInitialPosition: new THREE.Vector3(2.786939482308075, 1.48, -1.1),
  TerminalPosition: JSON.parse(data),
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

const iocScene = new IOCScene();
const animax = new AnimaxTimeline();

let pointer;
let stats;
let autoplayTM;
const ledSideT = new THREE.TextureLoader().load('/ui/ioc/screen/A13.png');
ledSideT.flipY = false;
const ledSide = new THREE.MeshBasicMaterial({ map: ledSideT })
const ledMats = [];
const init = async () => {
  // configure UI
  if (EditMode) {
    setupEditor(null);
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }
  const { screen, fn } = createLoadScreen();
  window.loadProgress = fn;
  const build = await SceneManager.setup("#app").then((r) => r);
  const outline = build.composer.outline;

  SceneManager.ioc = iocScene;

  let id = 0;

  SceneManager.on("loadbegin", (e) => console.log("begin", e));
  SceneManager.on("loadprogress", (e) => console.log("progress", e));
  SceneManager.on("loadcomplete", (e) => {
    let model = e.scene || e;
    if (id == 1) {
      SceneManager.scene.add(model);
      setupScreens(model, SceneManager.scene);
    } else if (id == 3) {
      SceneManager.tomi = new TOMIController(e);

      SceneManager.scene.add(SceneManager.tomi);
      SceneManager.tomi.position.set(
        SceneConfig.TomiInitialPosition.x,
        SceneConfig.TomiInitialPosition.y,
        SceneConfig.TomiInitialPosition.z);
      // SceneManager.tomi.mesh.position.set(0, 1, 0);
    } else if (id >= 4) {
      SceneManager.tomi.loadTracks(e, SceneConfig.Assets.Models[id]);
    } else {
      model.traverse(node => {
        if (node.type === 'Mesh') {
          if (node.name.startsWith('building003')) {
            node.visible = false;
          } else if (node.name.startsWith('led')) {
            node.material = (node.name === 'led1') ? setupVideoPanel() : ledSide.clone();
            iocScene._leds.push(node);
            ledMats.push(node);
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
    stats.begin();
    animax.update(delta);
  })

  SceneManager.on('afterRender', (delta = 0) => {
    stats.end();
  })

  SceneManager.on("loadfinished", async () => {
    window.addEventListener('resize', SceneManager._onResize.bind(SceneManager), false)
    iocScene.createFX(SceneManager.scene);
    const list = await iocScene.loadVideoList();
    if (!list) {
      console.warn('video playlist is not available');
    }
    //const p = confirm(`This website require user to interact first to allow audio/video normal playback.`)
    //if (!p) return

    // create the content layer
    SceneManager.tomi.sortAnimationClips()
    if (EditMode) {
      animax.setElement();
      showProps(SceneManager.tomi, SceneManager, animax);

    }
    SceneManager.tomi.play(1, THREE.LoopRepeat);
    SceneManager.tomi.rotateY(degToRad(180));
    SceneManager.tomi.disappear();

    const content = await iocScene.create(SceneManager.scene).then(obj => obj);
    SceneManager.scene.add(content);

    pointer = new Pointer3D(build.camera, build.scene, build.renderer.domElement, null, SpriteLayer, outline, true);
    iocScene.bindPointer(pointer);
    const btnPos = new THREE.Vector3(SceneConfig.TerminalPosition[0].x, SceneConfig.TerminalPosition[0].y + .3, SceneConfig.TerminalPosition[0].z + 2);
    content.position.copy(btnPos);
    content.children[0].rotateY(degToRad(90));

    pointer.on('pointertouch', ({ pos, objects }) => {
      if (objects.length) {
        const sel = objects[0]
       //console.log('down', sel);
      }
    });

    pointer.on('pointerup', ({ pos, objects }) => {
      console.log('up', objects);
      if (objects.length <= 0)
        return
      if (objects[0] instanceof SpriteButton) {
        const sel = objects[0];
        const data = objects[0].userData || {};

        switch (data.content) {
          case 'move':
            SceneManager.controls.target = sel.userData.target;
            const p = SceneManager.tomi.position.clone();
            p.y = SceneManager.tomi.position.y + SceneManager.tomi.mesh.position.y;
            SceneManager.controls.lookAt(p);
            SceneManager.controls.moveTo(new THREE.Vector3(sel.userData.position.x, SceneConfig.TerminalPosition[0].y + .25, sel.userData.position.z), 0, () => {
              const cpos = SceneManager.camera.position.clone();
              cpos.z += 0.01;
              SceneManager.controls.c.target = cpos;
              SceneManager.controls.c.enablePan = false;
              SceneManager.controls.c.enableZoom = false;
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
        }
      }
    });

    iocScene.on('videoended', (e) => {
      if (autoplayTM) {
        clearInterval(autoplayTM);
        autoplayTM = null;
      }
      if (!iocScene.endOfList()) {
        if (!iocScene.guides.next){
          SceneManager.controls.lookAt(iocScene.Button(3).position, true);
          iocScene.guides.next = true;
        }
        iocScene.Button(3).show();
      } else {
        iocScene.Button(4).show();
      }

    })

    iocScene.on('newplaylist', (e) => {

      //SceneManager.tomi.play(1);
      iocScene.Button(3).hide();
      iocScene.Button(4).hide();

    });
    animax.on('seek', (time) => {
      console.log(time, SceneManager.tomi.soundDuration().timeDisplay);

      // if(SceneManager.tomi._sound) SceneManager.tomi._sound.pos = time;
    })


    iocScene.on('onmediastart', (video, audio, set, index) => {
      SceneManager.controls.lookAt(SceneManager.tomi.position.clone(), true);
      animax.useMedia(video, SceneManager.tomi._sound, video.duration);
      if (autoplayTM) {
        clearInterval(autoplayTM);
        autoplayTM = null;
      }
      autoplayTM = setInterval(_ => {
        const list = ["talkAction", "talkAction2", "talkAction3", "talkAction4", "eureka", "thinking", "sigh"]
        const id = Math.min(Math.round(Math.random() * list.length), list.length-1);
        SceneManager.tomi.actions(list[id])();
        console.log('random', list[id]);
      }, 1500);
      //animax.newTrack(`${set}_${index}`);
      //animax.play(`${set}_${index}`);
      // const tl = gsap.timeline({repeat: 0})



      if (set === 'cyber') {
        switch (index) {
          case 3:
            if (autoplayTM) {
              clearInterval(autoplayTM);
              autoplayTM = null;
            }
            // SceneManager.tomi.playSound('/video/cyber/audio/C02.mp3', false);
            SceneManager.tomi.face.useAudio = false;
            iocScene.FX('alarm').activate();

            break;
          default:
            iocScene.FX('alarm').deactivate();
            SceneManager.tomi._defaultClip = 1;
            SceneManager.tomi.play(1);
            SceneManager.tomi.face.reset();
            SceneManager.tomi.face.useAudio = true;
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
          SceneManager.tomi.appear();
          iocScene.setCurrentPlaylist('ioc');
          iocScene.nextVideo();

          break;
        case 3:
          SceneManager.tomi.appear();
          setTimeout(_=>{
          
            iocScene.setCurrentPlaylist('cyber');
            iocScene.nextVideo();
          }, 1000);
          
          break;
        case 0:
        default:
          SceneManager.tomi.disappear();
          iocScene.resetVideo();
          break;
      }
    })
    btnPos.y = SceneManager.tomi.mesh.position.y;
    SceneManager.controls.lookAt(btnPos);
    setupVideoPanel();


    // start the scene
    SceneManager.play();


    gsap.to(
      '#loading-screen',
      1,
      {
        opacity: 0,
      });

    // starting position
    SceneManager.camera.layers.enableAll();
    const pos = new THREE.Vector3(0, SceneConfig.TerminalPosition[0].y + .3, SceneConfig.TerminalPosition[0].z);
    SceneManager.tomi.position.z -= 0.5;
    SceneManager.controls.lookAt(pos);
    SceneManager.controls.c.screenSpacePanning = true;
    SceneManager.camera.position.set(0, SceneConfig.TerminalPosition[0].y + .3, -3.6778432270428207)
    SceneManager.camera.layers.disable(7);
  });

  SceneManager
    .loadAssets(SceneConfig.Assets.Models)
    .then((completed) => {
      res(completed);
    });
};

const setupVideoPanel = async (src = '/video/Fortinet Threat Map - Profile 1 - Microsoft_ Edge 2020-10-21 14-21-26.mp4') => {
  const videoEl = await createVideoElement({ preload: false, autoplay: true }, src).then(v => v);
  document.body.appendChild(videoEl);
  const videoTexture = new THREE.VideoTexture(videoEl);
  videoTexture.flipY = false;
  const videoMat = new THREE.MeshBasicMaterial({ map: videoTexture });
  videoEl.play();

  return videoMat;
}

document.body.onload = async (evt) => {
  await init();

  window.addEventListener('keydown', (e) => {
    if (e.key == 't') {
      iocScene.FX('alarm').activate();
    } else if (e.key == 'i') {
      iocScene.state = 1;
    } else if (e.key == 'p') {
      //const a = JSON.stringify([SceneManager.camera.position, SceneManager.camera.rotation]);
      const i = (Math.random() * iocScene._pos.length);
      SceneManager.tomi.moveToRef(i);
    } else if (e.key === 'x') {
      // SceneManager.tomi
      //   .playSound(SceneConfig.Assets.Audio[0])
      //   .then((audio) => {
      //     console.log('starts', audio);
      //     audio.play();
      //   });
     // SceneManager.tomi.(new THREE.Vector3(0, 0 ,0))
    } else if (e.key === 'y') {
      //
      SceneManager.tomi.action("intro")

      // speech.speak(text)
    } else if (e.key === 'z') {
      console.log(SceneManager.camera.position);

    } else if (e.key == 'u') {
      iocScene.nextVideo();
    }
  });
};