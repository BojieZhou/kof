import { Player } from '/static/js/player/base.js';
import { GIF } from '/static/js/utils/gif.js';

export class Kyo extends Player {
    constructor(root, info) {
        super(root, info);
        this.init_animations();
    }

    init_animations() {
        let outer = this;
        let offsets = [0, -22, -22, -140, 0, 0, 0];
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`); //每个状态对应不同的图片
            this.animations.set(i, {    //当不同的状态时，加载不同的图片的参数
                gif: gif,
                frame_cnt: 0,   // 总图片数
                frame_rate: 5, //每5帧过渡一次
                offset_y: offsets[i], //y方向偏移量
                loaded: false, //是否加载完整
                scale: 2, //放大多少倍
            });

            gif.onload = function () {
                let obj = outer.animations.get(i);  
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;  //被加载出来后才能进行渲染

                if (i === 3) {
                    obj.frame_rate = 4;
                }
            }
        }
    }
}