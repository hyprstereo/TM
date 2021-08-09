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

import { createLoadScreen, loadAsset } from "../js/controllers/ioc.js";
import { SceneManager } from "../js/controllers/view.js";
import { setupScreens } from "../js/scene/props.js";
import { TOMIController } from "../js/scene/tomi.controller.js";

export const Assets = { 
  models: [
    "/models/ioc/building2.glb",
    "/models/ioc/tables.glb",
    "/models/tom.gltf",
    "/models/tomi/long.gltf",
    "/models/tomi/ioc-intro.gltf",
    "/models/tomi/ioc-agility.gltf",
    "/models/tomi/ioc-competitive.gltf",
    "/models/tomi/ioc-cost.gltf",
    "/models/tomi/ioc-enablement.gltf"
  ],
  textures: ["/"],
};

const init = async () => {
  // configure UI
  //return await new Promise((res, rej) => {
  const { screen, fn } = createLoadScreen();
  window.loadProgress = fn;

  const build = await SceneManager
    .setup("#app").then((r) => r);

  console.log(build);
  let id = 0;
  SceneManager.on("loadbegin", (e) => console.log("begin", e));
  SceneManager.on("loadprogress", (e) => console.log("progress", e));
  SceneManager.on("loadcomplete", (e) => {


    let model = e.scene || e;


    if (id == 1) {
      SceneManager.scene.add(model);
      setupScreens(model, SceneManager.scene);

    } else if (id == 2) {


      SceneManager.tomi = new TOMIController(e);
      SceneManager.scene.add(SceneManager.tomi);

      
    } else if(id >= 3){
      SceneManager.tomi.loadTrack(e);
    }else {
      if (id < 3) {
      model.traverse(node=>{
        if(node.type === 'Mesh') {
          node.castShadow = false;
          node.receiveShadow = false;
        }
      })
      SceneManager.scene.add(model);
    }
    }
   
    id++;
    console.log("complete", model);
   
  });

  SceneManager.on("loadfinished", () => {
    //SceneManager.on("render", );
    SceneManager.play();
    SceneManager.tomi.randomClip()
    anime({
      targets: '#overlay',
      opacity: 0,
    });
    const pos = SceneManager.tomi.position.clone()
    pos.y = 1;
    SceneManager.controls.lookAt(pos)
    SceneManager.tomi.lookAt(SceneManager.camera.position)
  });
  SceneManager.loadAssets(Assets.models)
    .then((completed) => {
      res(completed);
    });
  //});
};

document.body.onload = async (evt) => {
  await init();
};
