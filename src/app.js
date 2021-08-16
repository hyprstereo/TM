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

import { createLoadScreen, loadAsset } from "./controllers/ioc.js";
import { SceneManager } from "./controllers/view.js";
import { setupScreens } from "./scene/props.js";
import { TOMIController, TomiFace } from "./controllers/tomi.controller.js";
import { IOCScene } from "./scene/ioc.js";
import { LoopRepeat, MeshBasicMaterial, MeshNormalMaterial, Vector3, VideoTexture } from "./build/three.module.js";
import { createVideoElement } from "./interact/pano.js";
import { Pointer3D } from "./interact/pointer.js";
import { SpriteButton, SpriteLayer } from "./objects/sprites.js";
import { TTS } from "./utils/tts.js";
import { EditMode, setupEditor } from "./interact/ui.js";
import Stats from "./build/stats.module.js";
import { degToRad } from "./utils/helpers.js";

const data = `[{"x":2.7278134036195496, "y": 1.183559422099973, "z": -3.2312832293855966},{"_x":-2.966433655861033,"_y":0.03200187598513606,"_z":3.135930225859582,"_order":"XYZ"}]`
export const SceneConfig = {
  StartPos: { x: 0, y: 0, z: 0 },
  TomiInitialPosition: new Vector3(2.786939482308075, .48, -1.1),
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
let pointer;
let stats;
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
  console.log(outline);
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
      //SceneManager.tomi._clips = [];
      SceneManager.scene.add(SceneManager.tomi);
      SceneManager.tomi.position.set(
        SceneConfig.TomiInitialPosition.x,
        SceneConfig.TomiInitialPosition.y,
        SceneConfig.TomiInitialPosition.z);
      SceneManager.tomi.mesh.position.set(0, 1, 0);
    } else if (id >= 4) {
      SceneManager.tomi.loadTracks(e, SceneConfig.Assets.Models[id]);
    } else {
      model.traverse(node => {
        if (node.type === 'Mesh') {
          if (node.name.startsWith('building003')) {
            node.visible = false;
          } else if (node.name.startsWith('led')) {
            node.material = (node.name === 'led1') ? new MeshBasicMaterial() : new MeshNormalMaterial();
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
  })

  SceneManager.on('afterRender', (delta = 0) => {
    stats.end();
  })

  SceneManager.on("loadfinished", async () => {
    //load the video list
    const list = await iocScene.loadVideoList();
    if (!list) {
      console.warn('video playlist is not available');
    } 
    const p = confirm(`This website require user to interact first to allow audio/video normal playback.`)
    if (!p) return

    // create the content layer
    SceneManager.tomi.sortAnimationClips()
    SceneManager.tomi.showProps(true);
    SceneManager.tomi.play(1, LoopRepeat);
    SceneManager.tomi.rotateY(degToRad(180));
    SceneManager.tomi.disappear();

    const content = await iocScene.create().then(obj => obj);
    SceneManager.scene.add(content);

    pointer = new Pointer3D(build.camera, build.scene, build.renderer.domElement, null, SpriteLayer, outline, true);
    iocScene.bindPointer(pointer);
    const btnPos = new Vector3(SceneConfig.TerminalPosition[0].x, SceneConfig.TerminalPosition[0].y + .3, SceneConfig.TerminalPosition[0].z + 2);
    content.position.copy(btnPos);
    content.children[0].rotateY(degToRad(90));

    pointer.on('pointertouch', ({pos, objects}) => {
      if (objects.length) {
        const sel = objects[0]
        console.log('down', sel);
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
            SceneManager.controls.moveTo(new Vector3(sel.userData.position.x, btnPos.y, sel.userData.position.z), 0, () => {
              iocScene.state = 1;
            });
            break;
          case 'ioc':
            iocScene.state = 2;
            break
          case 'cyber':
            iocScene.state = 3;
            break
        }
      }
    });

    iocScene.on('videoloaded', ({event, video}) =>{
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
          iocScene.setCurrentPlaylist('cyber');
          iocScene.nextVideo();
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


    anime({
      targets: '#overlay',
      opacity: 0,
    });

    // starting position
    SceneManager.camera.layers.enableAll();
    const pos = new Vector3(0, 1.4501, SceneConfig.TerminalPosition[0].z);
    SceneManager.tomi.position.z -= 0.5;
    SceneManager.controls.lookAt(pos);
    SceneManager.controls.c.screenSpacePanning = true;
    SceneManager.camera.position.set(0, 1.403584378054217, -3.6778432270428207)


  });

  SceneManager
    .loadAssets(SceneConfig.Assets.Models)
    .then((completed) => {
      res(completed);
    });
};

const setupVideoPanel = async () => {
  const videoT = await createVideoElement('/video/Fortinet Threat Map - Profile 1 - Microsoft_ Edge 2020-10-21 14-21-26.mp4').then(v => v);
  document.body.appendChild(videoT);
  const videoMat = new VideoTexture(videoT);
  videoMat.flipY = false;
  ledMats[1].material = new MeshBasicMaterial({ map: videoMat });
  videoT.play();
}

document.body.onload = async (evt) => {
  await init();

  window.addEventListener('keydown', (e) => {
    if (e.key == 't') {
      SceneManager.tomi.save(false);
    } else if (e.key == 'i') {
      iocScene.state = 1;
    } else if (e.key == 'p') {
      const a = JSON.stringify([SceneManager.camera.position, SceneManager.camera.rotation]);
    } else if (e.key === 'x') {
      SceneManager.tomi
        .playSound(SceneConfig.Assets.Audio[0])
        .then((audio) => {
          console.log('starts', audio);
          audio.play();
        });
      // SceneManager.tomi.playSound(0);
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