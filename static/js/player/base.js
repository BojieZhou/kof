import { AcGameObject } from '/static/js/ac_game_object/base.js';

export class Player extends AcGameObject {
    constructor(root, info) {
        super();

        this.root = root;
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.direction = 1; //正方向定义成1，反方向定义成-1

        this.vx = 0;
        this.vy = 0;

        this.speedx = 270; //水平速度
        this.speedy = -1000; //跳起初始速度

        this.gravity = 50; //重力加速度

        this.ctx = this.root.game_map.ctx;
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        this.status = 3; // 状态机表示人物不同的状态 0:idle, 1:向前, 2:向后, 3:跳跃, 4:攻击, 5:被打, 6:死亡
        this.animations = new Map();    //把每一个状态的动作存到一个map里边
        this.frame_current_cnt = 0; //表示记录了多少帧

        this.hp = 100;  // 血量

        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`)
        this.$hp_div = this.$hp.find('div');
    } 

    start() {

    }

    update_control() {
        let w, a, d, space;
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        if (this.status === 0 || this.status === 1) {
            if (space) {
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0;
            }else if (w) {
                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.vy = this.speedy;
                this.status = 3;
                this.frame_current_cnt = 0;
            } else if (d) {
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {
                this.vx = -this.speedx;
                this.status = 1;
            } else {
                this.vx = 0;
                this.status = 0;
            }
        }
    }

    update_move() {
        this.vy += this.gravity; 

        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        // 掉落到平地就停下来 
        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
            if(this.status === 3) this.status = 0;    //跳跃状态完成后转变为静止状态
        }

        // 加入左右限制，防止移动出地图
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }

        // 加入推人效果 2022/10/28
        let [a, b] = this.root.players;

        if (a != this) [a, b] = [b, a];

        let r1 = {
            x1: a.x,
            y1: a.y,
            x2: a.x + a.width,
            y2: a.y + a.height,
        };
        let r2 = {
            x1: b.x,
            y1: b.y,
            x2: b.x + b.width,
            y2: b.y + b.height,
        };

        if (this.is_collision(r1, r2)) {    // 另其同时进行移动
            b.x += this.vx * this.timedelta / 1000 / 2;
            b.y += this.vy * this.timedelta / 1000 / 2;
            a.x += this.vx * this.timedelta / 1000 / 2;
            a.y += this.vy * this.timedelta / 1000 / 2;
        }
    }

    // 修改对称
    update_direction() {
        if (this.status === 6) return;
        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) me.direction = 1;
            else me.direction = -1;
        }
    }

    // 被攻击到了
    is_attack() {
        if (this.status === 6) return;
        this.status = 5;
        this.frame_current_cnt = 0;
        this.hp = Math.max(this.hp - 20, 0);

        // 改变血槽长度
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100,
        }, 600);

        this.$hp_div.animate({
            width: this.$hp.parent().width() * this.hp / 100,
        }, 300);

        if (this.hp <= 0) {
            this.status = 6;
            this.frame_current_cnt = 0;
            this.vx = 0;
        }
    }

    // 判断矩形有没有交集
    is_collision(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) {
            return false;
        }
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) {
            return false;
        }
        return true;
    }

    // 判断攻击
    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 18) {
            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {   //定义拳头打击区域的矩形
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 220,
                    y2: me.x + 40 + 20,
                };
            } else {
                r1 = {
                    x1: me.x + me.width - 120 - 100,
                    y1: me.y + 40,
                    x2: me.x + me.width - 120 - 100 + 100,
                    y2: me.x + 40 + 20,
                };
            }

            let r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height,
            };

            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }

    update() {
        this.update_control();
        this.update_move(); //先move再渲染，因为每次渲染的是当前这一帧的状态
        this.update_direction();
        this.update_attack();
        this.render();
    }

    render() {
        let status = this.status;

        // 判断前进还是后退
        if (this.status === 1 && this.direction * this.vx < 0) status = 2;

        let obj = this.animations.get(status);  //获取状态并传入，以加载不同的gif图片
        if (obj && obj.loaded) {
            if (this.direction > 0) {   //我的方向朝右的情况
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {    //我的方向朝左的情况
                this.ctx.save(); //先保存下配置
                this.ctx.scale(-1, 1); //水平方向翻转
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0); // 坐标轴向负方向平移

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.root.game_map.$canvas.width()-this.x-this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

                this.ctx.restore(); //变回原本状态
            }
        }

        // 播放完动画之后攻击停下来
        if (status === 4 || status === 5 || status === 6) {
            // 如果为obj.frame_cnt会闪的原因是播完最后一帧会继续再播一帧， -1是让播完最后一帧停下来
            if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {  // 判断是否进行到最后一帧
                if (this.status === 6) {
                    this.frame_current_cnt--; //与++抵消，一直处于倒地不起的状态
                } else {
                    this.status = 0;    
                }
            }
        }

        this.frame_current_cnt++;
    }
}