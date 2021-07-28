import { GLTFLoader } from "/js/jsm/loaders/GLTFLoader.js";
import * as THREE from "/js/build/three.module.js";
import { degToRad } from "../utils/helpers.js";
import { SETTINGS } from "../scene/config.js";
import { GLTFExporter } from "/js/jsm/exporters/GLTFExporter.js";
import { SaveString } from "../utils/helpers.js";
import { CSS3DRenderer, CSS3DObject } from "../jsm/renderers/CSS3DRenderer.js";

export const Assets = [
  "/models/ioc/building2.glb",
  "/models/ioc/tables.glb",
  "/models/ioc/table_set.glb",
];
const props = [
  {
    name: "printer",
    w: 0.345,
  },
  {
    name: "files",
    w: 0.157969,
  },
  {
    name: "dusbin",
    w: 0.226306,
  },
];

const propsMonitor = {
  name: "monitor",
  w: 0.855898,
};

const tableMat = {};
export const LoadAssets = async (
  scene,
  progress = undefined,
  center = new THREE.Vector3()
) => {
  return await new Promise((res, rej) => {
    const loader = new GLTFLoader();
    let assets = [];
    let tablePositions = [];
    let counter = 0;

    const files = SETTINGS.useExportedAssets
      ? [Assets[0], Assets[1]]
      : [Assets[0], Assets[2]];

    files.forEach((file, i) => {
      const name = getName(file);
      loader.load(
        file,
        (asset) => {
          const model = asset.scene || asset;

          if (name == "nulls") {
            tablePositions = getPositions(model.children[0], scene);
          } else {
            // console.log("loaded", name, model);
            if (model) {
              if (name.startsWith("table_set") && !SETTINGS.useExportedAssets) {
                setupTables(model, scene, false);
              } else {
                //fixMaterials(model);
                model.name = name;
                scene.add(model);
                if (name.startsWith("table")) {
                  setupScreens(model);
                  //fixMaterials(model);
                } else {
                  // model.traverse(node=> {
                  //   if (node.type === 'Mesh' && (!node.name.startsWith('keyboard') || !node.name.startsWith('screen') )) {
                  //     node.material.polygonOffset = true;
                  //     node.material.polygonOffsetFactor = -0.1;
                  //     node.material.needsUpdating = true;
                  //     node.material.side = THREE.DoubleSide;
                  //   } else if (node.type === 'Material') {
                  //     if(node.map) node.map.filter = THREE.LinearMipmapLinearFilter;
                  //   }
                  // })
                  //ExportToGLTF('building.gltf', model);
                }
              }
            }
          }
          counter++;
          if (counter > files.length - 1) {
            res({ assets: assets, positions: tablePositions });
          }
        },
        (p) => {
          const total = Humanize.fileSize(p.total);
          const loaded = Humanize.fileSize(p.loaded);
          if (loaded / total)
            window.loadProgress(`Loading ${name}: ${loaded} of ${total}`);
          else window.loadProgress("Assets Loaded");
        },
        (err) => {
          rej(err);
        }
      );
    });
  });
};

export const loadFrame = (url) => {
  const iframe = document.createElement('iframe');
  iframe.style.width = `100%`;
  iframe.style.height = `100%`;
  iframe.src = url;
  return iframe;
}

export const createCSSElement = (el, scene, target)=>{
  const cr = new CSS3DRenderer();
  const obj = new CSS3DObject(el);

}

const setupTables = (model, scene, exportFile = false) => {
  fixMaterials(model);
  const tGroup = new THREE.Object3D();
  tGroup.name = "tables";
  const size = new THREE.Box3()
    .setFromObject(model)
    .getSize(new THREE.Vector3());
  const rowSet = colTables(model, 6, size.x, 1);
  rowSet.position.set(1.623, 0, -7);

  const tables = rowTables(scene, rowSet, 6);
  tGroup.add(tables);

  rowSet.position.set(-14, 0, -7);
  const tables2 = rowTables(scene, rowSet, 6);
  tGroup.add(tables2);
  scene.add(tGroup);
  if (exportFile) ExportToGLTF("tables.gltf", tGroup);

  return tGroup;
};

const setupScreens = (tablesSet) => {
  const keyboard = new THREE.MeshLambertMaterial({
    color: 0x59f4f6,
    emissive: 0x59f4f6,
    //emissiveIntensity: 1,
    transparent: true,
  });
  const screen = new THREE.MeshLambertMaterial({
    color: 0xffffff,
  });
  const screen2 = screen.clone();

  const lt = new THREE.TextureLoader();
  lt.load('../../ui/ioc/screen/A15.png', (t) =>{
    screen2.map = t;
  })
  lt.load("../../ui/ioc/screen/VMS.jpg", (texture) => {
    screen.map = texture;
    let counter = 0;
    tablesSet.traverse((node) => {
      console.log(node);

      if (node.type === "Mesh") {
        // if (node.name.startsWith("table_geo_00000") && node.material.name.startsWith('chair_table_mat')) {
        //   if (!tmat) {
        //     tmat = new THREE.MeshStandardMaterial({
        //       map: node.map,
        //       color: 0x888888,
        //     })
        //   }

        //   node.material = tmat;

        //   node.castShadow = node.receiveShadow = true;
        if (node.name.startsWith("dust")) {
          node.material.side = THREE.DoubleSide;
        } else if (node.material.name.startsWith("screen_monitor")) {
          node.material = (counter % 2 == 2) ? screen.clone() : screen2.clone();
        } else if (node.name.startsWith("keyboard")) {
          if (!keyboard.map) {
            keyboard.map = node.material.map;
            keyboard.alphaMap = node.material.alphaMap;
          }
          node.material = keyboard;
        }
        //node.map.needsUpdate = true;
        node.castShadow = node.receiveShadow = true;
      } else {
      }
      counter++;
    });
  });
};

const colTables = (target, count = 6, size = 0, offset = 1) => {
  const group = new THREE.Object3D();
  const startX = size * 0.5;
  for (let i = 0; i < count; i++) {
    const clone = target.clone();
    group.add(clone);
    clone.position.set(startX + size * (i * offset), 0, 0);
  }
  return group;
};

const rowTables = (scene, table, count = 4, offset = 2.5) => {
  let tables = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const table2 = table.clone();
    table2.children.forEach((t) => {
      naturalize(t, 0.99);
    });
    tables.add(table2);
    table2.position.z += i * offset;
  }
  return tables;
};

const getPositions = (model, scene = undefined) => {
  console.log(model);
  let arr = [];

  model.traverse((node) => {
    if (node.name.startsWith("Light")) {
      arr.push(node.position);
    }
    c++;
  });
  return arr;
};

const getName = (file) => {
  let index = file.lastIndexOf("/");
  let res = file.substr(index + 1);
  res = res.substr(0, res.lastIndexOf("."));
  return res;
};

const fixMaterials = (asset, shadow = false) => {
  let map;
  asset.traverse((node) => {
    //console.log(node);

    if (node.type == "Mesh") {
      const isTable = node.name.startsWith("table");
      const isScreen = false; //node.name.startsWith('Mesh011_2');
      map = isScreen ? screenVideoMaterial : node.material.map;
      if (!tableMat[node.name]) {
        tableMat[node.name] = new THREE.MeshPhysicalMaterial({
          map: map || null,
          alphaMap: node.material.alphaMap || null,
          transparent: node.material.transparent || null,
          color: node.material.color || null,
          metalness: isTable ? 0.2 : 0,
          roughness: isTable ? 1 : 0,
          // normalMap: isTable? node.material.normalMap : null,
          // normalMapType: THREE.ObjectSpaceNormalMap,
        });
        tableMat[node.name].name = node.material.name;
      }
      node.material = tableMat[node.name];

      if (!node.name.startsWith("keyboard")) {
        if (node.name.startsWith("Mesh017"))
          node.material.side = THREE.DoubleSide;
        if (!isScreen || isTable()) {
          node.castShadow = node.receiveShadow = shadow;
        }
      } else {
        if (!tableMat[node.name]) {
          tableMat[node.name] = new THREE.MeshBasicMaterial({
            map: map || null,
            alphaMap: node.material.alphaMap || null,
            transparent: true,
            color: 0x5ff5ff,
            // emissive: 0x5ff5ff,
            emissiveIntensity: 1.8,
          });
        }
        if (SETTINGS.bloom) {
          node.layers.enable(SETTINGS.BLOOM_SCENE);
        }
      }
    }
  });
};

function naturalize(mesh, start = 0.999, width = 100) {
  let p = _.shuffle(props);
  p = [p[0], p[1], propsMonitor, p[2]];

  let pos = start;
  p.forEach((prop, i) => {
    const obj = mesh.getObjectByName(`${prop.name}_geo_000001`);

    if (obj) {
      if (prop.name === "monitor") {
        const keyboard = mesh.getObjectByName(`keyboard_geo_000001`);
        const mouse = mesh.getObjectByName(`mouse_geo_000001`);
        obj.position.z += 0.02;
        obj.add(keyboard);
        obj.add(mouse);
        keyboard.position.y = mouse.position.y = 0;
        if (Math.random() * 5 < 2) {
          mouse.position.x = mouse.position.x * -1.12;
        }
        randomYBetween(obj, -0.02, 0.02);
      } else {
        randomYBetween(obj, -0.2, 0.2);
      }
      const size = prop.w;
      obj.position.x = pos - size / 2;

      pos -= size + 0.12;
    }
  });
  const chair = mesh.getObjectByName("chair_geo_000001");
  randomYBetween(chair);
}

function randomYBetween(obj, min = -20, max = 20) {
  const r = randomBetween(-10, 10);
  obj.rotation.set(0, degToRad(r), 0);
}

function randomBetween(min, max) {
  let res = Math.random() * (max - min);
  res = min + res;
  return res;
}

export const BloomShader = `
varying vec2 vUv;

void main() {

  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`;

export const BloomFragment = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {

  gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

}
`;

const applyBloom = (target) => {};

export const ExportToGLTF = async (name, ...obj) => {
  return await new Promise((res, rej) => {
    const exporter = new GLTFExporter();
    exporter.parse(obj, (gltf) => {
      console.log("exported", name, gltf);
      SaveString(gltf, name);
    });
  });
};
