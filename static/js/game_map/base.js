import { AcGameObject } from '/static/js/ac_game_object/base.js';
import { Controller } from '/static/js/controller/base.js';

class GameMap extends AcGameObject {
    constructor(root) {
        super();

        this.root = root;
        this.$canvas = $('<canvas width="1280" height="720" tabindex=0></canvas>');  //tabindex=0,聚焦,获取键盘输入
        this.ctx = this.$canvas[0].getContext('2d');    //ctx是canvas的对象
        this.root.$kof.append(this.$canvas);    // 将canvas聚焦到图片之后
        this.$canvas.focus();

        this.controller = new Controller(this.$canvas);

        this.root.$kof.append($(`<div class="kof-head">
        <div class="kof-head-hp-0"><div><div></div></div></div>
        <div class="kof-head-timer">60</div>
        <div class="kof-head-hp-1"><div><div></div></div></div>
        </div>
        `));

        this.time_left = 60000;
        this.$timer = this.root.$kof.find(".kof-head-timer");
    }

    start() {   

    }

    update() {
        this.time_left -= this.timedelta;
        if (this.time_left < 0) {
            this.time_left = 0;
            let [a, b] = this.root.players;
            if (a.status !== 6 && b.status !== 6) {
                a.status = b.status = 6;
                a.frame_current_cnt = b.frame_current_cnt = 0;
                a.vx = b.vx = 0;
            }
        }
        
        this.$timer.text(parseInt(this.time_left / 1000));
        this.render();
    }

    render() {  //每一帧都要清空一遍，这样的话物体才会在移动，否则物体是在画线，保存下轨迹
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
     }
}

export {
    GameMap
}