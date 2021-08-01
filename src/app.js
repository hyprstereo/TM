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
import * as TM from "./controllers/main.js";
import { LoadAssets } from "./scene/ioc.js";

import { TOMIController } from "./scene/tomi.controller.js";

export const assetManifest = {
  models: ["/assets/models/building2.glb", "/assets/models/tables.glb"],
  textures: ["/"],
};

const init = async () => {
  const { screen, fn } = createLoadScreen();
  window.loadProgress = fn;

  const created = await TM.SceneManager.setup("#app").then((r) => r);

  if (created) {
    loadAsset(TM.SceneManager.scene).then((assets) => {
      console.log(assets)


      );
      TM.SceneManager.on('render', (delta, elapse) => {
        console.log('render')
        TM.SceneManager.controls.update();
        TM.SceneManager.tomi.update(delta, elapse)
        //TM.SceneManager.composer.render();
      })
    });
  }
};

document.body.onload = async (evt) => {
  await init();
};
