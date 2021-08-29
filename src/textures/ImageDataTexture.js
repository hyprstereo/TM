import * as THREE from "../build/three.module";

//TODO: refine import
export class ImageDataTexture extends THREE.Texture {
    constructor(image = THREE.Texture.DEFAULT_IMAGE, mapping = THREE.Texture.DEFAULT_MAPPING, wrapS = THREE.ClampToEdgeWrapping, wrapT = THREE.ClampToEdgeWrapping, magFilter = THREE.LinearFilter, minFilter = THREE.LinearMipmapLinearFilter, format = THREE.RGBAFormat, type = THREE.UnsignedByteType, anisotropy = 1, encoding = THREE.LinearEncoding) {
        super(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);
    }

    fromImageData(imgData) {
        this.image = imgData;
        this.needsUpdate = true;
        return this.image;
    }

    fromCanvas(canvas, x = 0, y = 0, width = undefined, height = undefined) {
        const context = canvas.getContext('2d');
        if (!width) width = context.width;
        if (!height) height = context.height;
        const imgData = context.getImageData(x, y, width, height);
        this.fromImageData(imgData);
        return this.image;
    }
}


/**
 * 
 processor.computeFrame = function computeFrame() {
    this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
    const frame = this.ctx1.getImageData(0, 0, this.width, this.height);
    const length = frame.data.length;

    for (let i = 0; i < length; i += 4) {
      const red = data[i + 0];
      const green = data[i + 1];
      const blue = data[i + 2];
      if (green > 100 && red > 100 && blue < 43) {
        data[i + 3] = 0;
      }
    }
    this.ctx2.putImageData(frame, 0, 0);
  };

 var data = new Uint8Array( 4 * size );

// initialize data. . .

var texture = new THREE.DataTexture( data, width, height, THREE.RGBAFormat );

texture.type = THREE.UnsignedByteType;

var material = new THREE.MeshBasicMaterial( { map: texture } );

var mesh = new THREE.Mesh( geometry, material );

scene.add( mesh );
 */