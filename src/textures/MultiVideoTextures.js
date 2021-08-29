import { CanvasTexture } from "/build/three.module";

export class MultiVideoTexture extends CanvasTexture {
    constructor(videos = []) {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        // document.body.appendChild(canvas);
        // canvas.style.transform = 'scale(0.5)'
        super();
        
        // this.canvas = canvas;
        // this.context = this.canvas.getContext('2d');

        this.maxCol = col;
        this.maxRow = row;
        this.baseSize = 1024
        this.videos = [];
        this.addVideo(videos)
    }

    addVideo(...video) {
        video.forEach((v,i)=>{
            const newCol = i % this.maxCol;
            const newRow = Math.floor(this.videos.length % this.maxCol);
            this.videos.push({
                image: video,
                x: newCol,
                y: newRow
            });
        })
    }

    update() {
        this.videos.forEach((video, i) => {
            this.context.drawImage(video, x, y, 1024, 1024);
        });
        this.needsUpdate = true;
    }
}