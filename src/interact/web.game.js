import { CanvasTexture, ClampToEdgeWrapping, LinearMipMapLinearFilter, MirroredRepeatWrapping, NearestFilter, RGBAFormat, WrapAroundEnding } from "../build/three.module";

export const createInteractiveCanvas = async (width = 1280, height = 720, data = '/icons.json') => {

    const div = document.createElement('div');
    div.style.position = `absolute`;
    div.style.display = `none`;
    

    document.getElementById('app').appendChild(div);
    let stage, lineLayer, iconLayer, icons;
    let texture, ln;
    let listeners = {}
    ln = new Konva.Line({
        strokeWidth: 2,
        stroke: 'black'
    })

    const addListener = (type, listener) => {
        listeners[type] = listener;
    }

    const onUpdate = (type, ...params) => {
        if (listeners[type]) {
            listeners[type](...params);
        }
    }

    const render = () => {

        if (icons) {
            let pts = [];

            icons.forEach((ic, x) => {


                if (ic.parent) {
                    const p1 = ic.img;
                    const p2 = ic.parent.img || null;
                    if (p2)
                    pts.push(p1.x(), p1.y(), p2.x(), p2.y())
                }

            })
            ln.points(pts);
            ln.draw();
            onUpdate('render');
        }
        
    }
    const create = async () => {
        stage = new Konva.Stage({
            width: width,
            height: height,
            container: div,
            background: 'white'
        });

        var rect = new Konva.Rect({
            width: width,
            height: height,
            fill: 'white',
        });

        iconLayer = new Konva.Layer();
        iconLayer.add(rect);
        lineLayer = new Konva.Group();
        lineLayer.add(ln);
        //stage.add(lineLayer);
        stage.add(iconLayer);
        iconLayer.add(lineLayer);

        const d = await fetch(data)
            .then(response => response.json())
        if (d) {
            icons = d.icon;


            icons.forEach((icon, i) => {
                const url = "/ui/image/" + icon.iconType + ".png";
                Konva.Image.fromURL(url, (img) => {
                    img.setAttrs({
                        x: icon.x,
                        y: icon.y,
                        scaleX: .5,
                        scaleY: .5,
                        draggable: true
                    });
                    //img.cache({ x: -img.width / 2, y: -img.height / 2 })
                    img.offsetX( img.width()/2);
                    img.offsetY(img.height()/2);
                    icon.img = img;
                    if (icon.parent) {
                        const res = icons.filter(ic => ic.name === icon.parent);
                        if (res) icon.parent = res[0];
                        else icon.parent = null;
                    }
                    img.on('dragstart', () => {
                        icon.dragging = true;
                        render()
                    })
                    img.on('dragmove', () => {
                        if (icon.dragging) render();
                    })
                    img.on('dragend', () => {
                        icon.dragging = false;
                    })
                    iconLayer.add(icon.img);
                    iconLayer.draw();
                    icons[i] = icon;
                    render();
                })
            });
            // texture = new CanvasTexture(stage.toCanvas());
        }
    }
    if (!Konva) {
        const js = document.createElement('script');
        document.getElementsByTagName('head')[0].appendChild(js);
        js.type = 'text/javascript';
        js.src = '/build/konva.min.js';
        js.onload = function () {
            console.log('added');
            create();
        }
    } else {
        create();
    }

    const renderImage = (mimeType = 'image/png', config = {}) => {
        config = {
            width: stage.width,
            height: stage.height,
            x: 0,
            y: 0,
            mimeType: mimeType,
            ...config
        }
        const img = stage.toImage(config)
        return img;
    }


    return {
        addListener,
        renderImage,
        texture,
        render,
        create,
        lineLayer,
        stage,
        iconLayer,
        icons,
        div
    }
}





