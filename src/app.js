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
import { TOMIController } from "./scene/tomi.controller.js";

export const Assets = {
  models: [
    "/models/ioc/building2.glb",
    "/models/ioc/tables.glb",
    "/models/tomi-anim3.glb",
  ],
  textures: ["/"],
};

const init = async () => {
  // configure UI
  //return await new Promise((res, rej) => {
    const { screen, fn } = createLoadScreen();
    window.loadProgress = fn;

    const build = await SceneManager.setup("#app").then((r) => r);
    console.log(build);

    SceneManager.on("loadbegin", (e) => console.log("begin", e));
    SceneManager.on("loadprogress", (e) => console.log("progress", e));
    SceneManager.on("loadcomplete", (e) => {
      const model = e.scene || e;
      console.log("complete", model);
      SceneManager.scene.add(model);
    });

    SceneManager.on("loadfinished", () => {
      //SceneManager.on("render", );
      SceneManager.play();
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
