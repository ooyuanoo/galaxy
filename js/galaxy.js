/**
 * Created by Choojen on 2016/12/27.
 */
'use strict';
var Setting = function(){
    this.prizeLevelSize = [
        {
            name: "小米VR眼镜",
            src: "prize-0.jpg",
            num: 10,
            level: 5
        },
        {
            name: "小米充电宝",
            src: "prize-1.jpg",
            num: 10,
            level: 5
        },
        {
            name: "小米多功能插板",
            src: "prize-2.jpg",
            num: 10,
            level: 5
        },
        {
            name: "马卡龙暖手宝",
            src: "prize-3.jpg",
            num: 10,
            level: 5
        },
        {
            name: "怡禾康颈椎按摩器",
            src: "prize-4.jpg",
            num: 6,
            level: 4
        },
        {
            name: "iPhone 7plus(A1661)",
            src: "prize-10.jpg",
            num: 1,
            level: -1
        },
        {
            name: "米家LED智能台灯",
            src: "prize-5.jpg",
            num: 6,
            level: 4
        },
        {
            name: "kindle 6英寸",
            src: "prize-6.jpg",
            num: 6,
            level: 3
        },
        {
            name: "Beats EP头戴式耳机",
            src: "prize-7.jpg",
            num: 3,
            level: 2
        },
        {
            name: "JBL Charge2蓝牙音箱",
            src: "prize-8.jpg",
            num: 3,
            level: 1
        },
        {
            name: "iPad Air2 9.7英寸",
            src: "prize-9.jpg",
            num: 1,
            level: 0
        }
    ];
    this.numOfPeople = 166;
    this.specialList = {
        specialNum: ["137", "133", "70", "49", "36", "9", "152", "106", "82", "68", "2"],
        limitPrize: ["小米充电宝", "小米多功能插板"]
    };
};
var Config = new Setting();

(function(){
    var $prizePage = document.getElementsByClassName("prize-page")[0],
        $lotteryPage = document.getElementsByClassName("lottery-page")[0],
        $prizeWrapper = document.getElementById("prize-wrapper"),
        bodyHeight = navigator.userAgent.toLowerCase().match("chrome") ? document.body.scrollHeight : document.documentElement.scrollHeight,
        $winnerWrapper = document.getElementsByClassName("list-num")[0],
        bodyWidth = document.body.scrollWidth,
        canvas = document.getElementById('galaxy'),
        bakCanvas = document.getElementById('galaxy-bak'),
        $drawList = document.getElementsByClassName('draw-list')[0],
        $drawBtn = document.getElementsByClassName("list-draw-start")[0].children[0],
        $audio = document.getElementById("bg-music"),
        ctx = canvas.getContext('2d'),
        bakCtx = bakCanvas.getContext('2d'),
        initPathGap = 20,
        centerX = (bodyWidth - bodyWidth * .35) / 2,
        centerY = bodyHeight / 2,
        initR = centerY - initPathGap * 9,
        skewX = 0.9,
        skewY = 0.5,
        isEnd = false,
        a1 = initR * skewX,  //长半轴
        b1 = initR * skewY,  //短半轴
        maxX = centerX + a1, //路径的最大x坐标
        minX = centerX - a1, //路径的最小x坐标
        globals = {}, //球的集合
        level = Config.prizeLevelSize,  //所有奖品信息
        levelLength = level.length,     //奖品个数
        initStart = 0, //设置开始间隔值，主要用于加速度
        initLowerTime = 10, //初始interval时间
        glos = [],  //存储每一个球
        glosSizeArr = [2, 3, 5, 7], //球的半径大小设置
        intervalId,
        winnerList = [],    //全部中奖名单-号数
        tempList = [],      //当前奖品中奖名单
        waitingList = [],   //候补名单
        winnerObjects = JSON.parse(localStorage.getItem("winnerObject")) || []; //中奖集合

    $prizePage.style.height = bodyHeight + "px";
    $prizePage.style.width = bodyWidth + "px";

    var App = {
        getBrowserInfo: function(){
            var agent = navigator.userAgent.toLowerCase();

            if(agent.match("msie") ||
                (agent.match("windows nt 6.1;") && agent.match("trident/7.0;"))){
                bodyHeight = document.documentElement.scrollHeight;
                return {type: "ie", version: agent}
            }

            if(agent.match("firefox")){
                bodyHeight = document.documentElement.scrollHeight;
                return {type: "firefox", version: agent}
            }

            if(agent.match("chrome")){
                bodyHeight = document.body.scrollHeight;
                return {type: "chrome", version: agent}
            }
        },
        setRandR: function(i){
            for(var j = 0; j < glosSizeArr.length; j++){
                if(i % glosSizeArr[j] == 0){
                    return 10 + glosSizeArr[j]
                }
            }
        },
        setRandColor: function(n){
            var bg = ["yellow", "pink", "orange", "#FFC47A", "gold", "#B230E5", "#fff", "#C99", "#9C9", "#F90", "#096"],
                curbg = "#fff",
                arr = glosSizeArr;

            arr = arr.concat([11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]);
            for(var j = 0; j < arr.length; j++){
                if(n % arr[j] == 0){
                    curbg = bg[j];
                }
            }
            return curbg;
        },
        singleOne: function(mX, all, i){
            all.r = this.setRandR(i) || 7;
            all.sqrt = Math.sqrt(Math.abs((1 - Math.pow(all.x - centerX, 2) / Math.pow(all.a, 2)) * Math.pow(all.b, 2)));
            all.y = (all.flag ? - all.sqrt : all.sqrt) + centerY;

            this.drawPlanet(ctx, all.x, all.y, all.r, i + 1);

            return all;
        },
        getWinnerList: function(){
            if(winnerObjects.length > 0){
                for(var i = 0; i < winnerObjects.length; i++){
                    var data = winnerObjects[i].winner,
                        wls = [];

                    for(var k in winnerObjects[i].waittingObject){
                        wls = wls.concat(winnerObjects[i].waittingObject[k].split(","))
                    }
                    winnerList = winnerList.concat(data.split(",")).concat(wls);
                }
            }
        },
        setPrizeImage: function(){
            var innerEl = "",
                winnerObjects = JSON.parse(localStorage.getItem("winnerObject")) || [];

            $prizeWrapper.innerHTML = "";

            for(var i = 0; i < levelLength; i++){
                var className = "";

                //标注已经抽过奖的奖品
                for(var j = 0; j < winnerObjects.length; j++){
                    if(winnerObjects[j].name == level[i].name){
                        className = "isDrawed";

                        if(!$drawBtn.className.match("isDrawed")){
                            $drawBtn.className += " isDrawed"
                        }
                    }
                }

                innerEl += '<li data-index="'+ i +'" class="'+ className +'" data-name="'+ level[i].name +'" data-src="'+ level[i].src +'" data-num="'+ level[i].num +'" data-level="'+ level[i].level +'"><div><img src="image/'+ level[i].src +'"><br/><span>'+ level[i].name +'</span></div></li>';
            }

            $prizeWrapper.innerHTML = innerEl;
        },
        setCardBackImage: function(){
            for(var j = 0; j < levelLength; j++){
                var $span = $prizeWrapper.children[j].children[0].children[2];

                $span.style.lineHeight = $span.offsetHeight + "px";
                $prizeWrapper.children[j].style.backgroundImage = "url(./image/"+ j +".jpg)";
            }
        },
        setPrizeHeight: function(){
            var $prize = document.getElementsByClassName("prize")[0],
                width = $prize.offsetWidth;

            $prize.style.height = width + "px";
            $prize.style.top = bodyHeight / 2 - width / 1.3 + "px";
        },
        drawPlanet: function(ctx, x, y, r, n){
            var background = this.setRandColor(n) || '#fff',
                radial = ctx.createRadialGradient(x - r * .4, y - r * .4, r - (r - 2), x, y, r);

            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2*Math.PI);
            ctx.strokeStyle = background;
            ctx.lineWidth = 1;
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            radial.addColorStop(0, '#fff');
            radial.addColorStop(1, background);
            ctx.fillStyle = radial;
            ctx.fill();
            ctx.restore();

            ctx.beginPath();
            ctx.fillStyle = background;
            ctx.strokeStyle = background;
            ctx.fillText(n, x - r, y - r);
            ctx.restore();
        },
        runSingleOne: function(times, index){
            var that = this,
                bakBalls = [],
                i = 0,
                c = 0,
                length = times ? times : tempList.length;

            bakCanvas.height = bodyHeight;
            bakCanvas.width = bodyWidth - bodyWidth * .35;

            var drawBack = setInterval(function(){
                bakCtx.clearRect(0, 0, bodyWidth, bodyHeight);

                if(i < length){
                    if(!bakBalls[i]){
                        bakBalls[i] = {}
                    }

                    if(!bakBalls[i].x){
                        bakBalls[i].x = minX - c * 20;

                        if(bakBalls[i].y > $drawList.offsetTop &&
                            bakBalls[i].y < ($drawList.offsetTop + 50)){
                            bakBalls[i].y = centerY + c;
                        }else{
                            bakBalls[i].y = $drawList.offsetTop + 50;
                            //$drawList.offsetHeight / 2;
                        }

                        bakBalls[i].r = Math.random() * 10 + 5;
                    }else{
                        bakBalls[i].x += 40;

                        if(bakBalls[i].r < 25){
                            bakBalls[i].r += 2;
                        }
                    }

                    var name,
                        num = tempList[i];

                    if(times){
                        name = $winnerWrapper.children[parseInt(index)].children[1].innerText;
                        num = waitingList[name].num;
                    }


                    that.drawPlanet(bakCtx, bakBalls[i].x, bakBalls[i].y, bakBalls[i].r, num);
                    // that.drawSingleOne(bakBalls[i].x, bakBalls[i].y, bakBalls[i].r, tempList[i]);

                    if(bakBalls[i].x + bakBalls[i].r > bakCanvas.width){
                        if(i == 0 && !times){
                            $winnerWrapper.innerHTML = "";
                        }

                        if($drawList.className.indexOf("active") < 0){
                            $drawList.className += " active";
                        }

                        if(times){
                            $winnerWrapper.children[parseInt(index)].children[2].innerHTML += ",<em>" + waitingList[name].num + "</em>";
                        }else{
                            that.setSingleWinnerNum(tempList[i]);
                        }
                        i++;
                        c = 0;
                    }
                }else{
                    setTimeout(function(){
                        $drawList.className = $drawList.className.replace(" active", "");
                        $audio.volume = 0.4;
                    }, 2000);
                    that.turnGalaxy(initLowerTime);
                    clearInterval(drawBack);
                    $audio.volume = 0.7;
                    that.events();
                }
                c++;
            }, 50);
        },
        listTemplate: function(index, name, num, all){
            var waiting = all && all.waittingObject ? all.waittingObject[parseInt(index - 1)] : '';
            var hasWaiting = all && all.waittingObject && waiting ? ',<em>'+ waiting +'</em>' : '';

            var html = '<li>' +
                '<span>'+ index +'</span>' +
                '<span class="hidden">'+ name +'</span>' +
                '<span>'+ num + hasWaiting + '</span>' +
                '<span><button type="button" class="btn-add" data-name="'+ name +'" data-index="'+ (index - 1) +'">重抽</button></span>' +
                '</li>';

            return html
        },
        setSingleWinnerNum: function(num){
            var prize = JSON.parse(localStorage.getItem("curDraw")) || [],
                index = tempList.indexOf(num);

            $winnerWrapper.innerHTML += this.listTemplate(index + 1, prize.name, num);
        },
        setWinnerNum: function(times, index){
            var prize = JSON.parse(localStorage.getItem("curDraw")) || [],
                inhtml = "",
                time = times || prize.num;

            tempList = times ? localStorage.getItem("tempList").split(",") : [];

            function storeItems(tempList, winnerObject, winnerList){
                localStorage.setItem("tempList", tempList);
                localStorage.setItem("winnerObject", winnerObject);
                localStorage.setItem("winnerList", winnerList);
            }

            if(winnerObjects.length > 0) {
                for (var i = 0; i < winnerObjects.length; i++) {
                    if(prize.name == winnerObjects[i].name){
                        var winners = winnerObjects[i].winner.split(",");

                        tempList = winners;
                        // for(var k in winnerObjects[i].waittingObject){
                        //     var wArr = [];
                        //     var w = winnerObjects[i].waittingObject[k],
                        //         wa = typeof w == "number" ? w.split(",");
                        //
                        //     for(var h = 0; h < wa.length; h++){
                        //         if(wArr.indexOf(wa[h]) < 0){
                        //             wArr.push(wa[h])
                        //         }
                        //     }
                        //     w = wArr.join(",");
                        //     winnerObjects[i].waittingObject[k] = w;
                        // }

                        for(var j = 0; j < winners.length; j++){
                            inhtml += this.listTemplate(j+1, prize.name, winners[j], winnerObjects[i]);
                        }

                        $winnerWrapper.innerHTML = "";
                        $winnerWrapper.innerHTML = inhtml;

                        if(times){
                            winnerList = localStorage.getItem("winnerList").split(",");
                            getNum();
                            winnerObjects[i].winner = tempList.join(",");

                            if(!winnerObjects[i].waittingObject){
                                winnerObjects[i].waittingObject = {};
                            }

                            winnerObjects[i].waittingObject[index] = winnerObjects[i].waittingObject[index] ? winnerObjects[i].waittingObject[index] + ',' + waitingList[prize.name].num : waitingList[prize.name].num;
                        }
                        storeItems(winnerObjects[i].winner, JSON.stringify(winnerObjects), winnerList.join(","));
                        this.events();

                        return;
                    }
                }
            }

            function getNum(){
                var num = Math.floor(Math.random() * Config.numOfPeople) + 1;

                num = num.toString();

                if(tempList.indexOf(num) < 0 && winnerList.indexOf(num) < 0){
                    if(Config.specialList.limitPrize.indexOf(prize.name) < 0 &&
                        Config.specialList.specialNum.indexOf(num) >= 0){
                        getNum();
                    }else{
                        if(times){
                            waitingList[prize.name] = {
                                name: prize.name,
                                index: index,
                                num: num
                            }
                        }else{
                            tempList.push(num);
                        }
                        winnerList.push(num);
                    }
                }else{
                    getNum()
                }
            }

            //循环抽奖
            for(var i = 0; i < time; i++){
                getNum();
            }

            winnerObjects.push({
                name: prize.name,
                winner: tempList.join(",")
            });

            storeItems(tempList, JSON.stringify(winnerObjects), winnerList.join(","));
        },
        drawGalaxy: function(){
            var a = a1,
                gap = a * 2 / 10;

            canvas.height = bodyHeight;
            canvas.width = bodyWidth - bodyWidth * .35;

            ctx.clearRect(0, 0, bodyWidth, bodyHeight);

            function move(){
                for(var i = 0; i < Config.numOfPeople; i++){
                    if(!glos[i]){
                        glos[i] = {
                            flag: false,
                            minX: minX,
                            maxX: maxX,
                            initR: initR,
                            a: a1
                        };
                    }

                    if(!glos[i].x){
                        glos[i].initR = glos[i].initR  + (Math.floor( i / 10) - Math.round(Math.floor( i / 10) / 3)) * 25;
                        glos[i].a = glos[i].initR * skewX;
                        glos[i].b = glos[i].initR * skewY;

                        glos[i].maxX = centerX + glos[i].a;
                        glos[i].minX = centerX - glos[i].a;

                        if (i == 0) {
                            glos[i].x = glos[i].maxX;
                        } else {
                            glos[i].flag = glos[i - 1].flag;
                            glos[i].x = glos[i - 1].x + gap * (glos[i -1].flag ? 1: -1);

                            if(glos[i].x < glos[i].minX ) {
                                glos[i].x = glos[i].minX + (glos[i].minX - glos[i].x);
                                glos[i].flag = !glos[i].flag;
                            } else if( glos[i].x > glos[i].maxX){
                                glos[i].flag = !glos[i].flag;
                                glos[i].x = glos[i].maxX - (glos[i].x - glos[i].maxX);
                            }
                        }
                    }

                    // if(!glos[i].initStart){
                    //     glos[i].initStart = 0
                    // }

                    if(!glos[i].gap && glos[i].gap != 0){
                        glos[i].gap = gap;
                    }

                    glos[i].x = glos[i].x + initStart * (glos[i].flag ? 1 : -1);

                    if(glos[i].x < glos[i].minX) {
                        glos[i].x = glos[i].minX + (glos[i].minX - glos[i].x);
                        glos[i].flag = !glos[i].flag;
                    } else if( glos[i].x > glos[i].maxX){
                        glos[i].flag = !glos[i].flag;
                        glos[i].x = glos[i].maxX - (glos[i].x - glos[i].maxX);

                    }

                    // if(glos[i].isDrawed){
                    //     continue;
                    // }
                    //
                    // for(var k = 0; k < tempList.length; k++){
                    //     if((i + 1) == tempList[k]){
                    //         glos[i].x  += i;
                    //
                    //         if(glos[i].x = (bodyWidth - bodyWidth * .35)){
                    //             glos[i].isDrawed = true;
                    //         }else{
                    //             glos[i].isDrawed = false;
                    //         }
                    //     }
                    // }

                    glos[i].gap = gap;
                    if(winnerList.indexOf(i + 1 + "") >= 0){
                        continue;
                    }
                    globals[i] = this.singleOne.call(this, glos[i].maxX, glos[i], i);
                }
            }

            move.call(this, isEnd);
        },
        turnGalaxy: function(time){
            var a = 5;

            if(!time){
                time = 10;
                a = 20;
            }

            clearInterval(intervalId);
            intervalId = setInterval(function(){
                this.drawGalaxy();

                initStart = a;
                // if (initStart > levelLength) {
                //     initStart = 1;
                // }else{
                //     initStart += a;
                // }
            }.bind(this), 10)
        },
        events: function(){
            var guides = document.getElementsByClassName("guide")[0].children,
                that = this;

            //guide点击
            this.guideClick = function(){
                for(var i = 0; i < guides.length; i++){
                    guides[i].onclick = function(){
                        var target = this.getAttribute("data-target"),
                            $targetPage = document.getElementsByClassName(target)[0],
                            $prizeTitle = document.getElementsByClassName("list-img-head")[0];

                        $targetPage.style.left = 0;

                        this.className = this.className.replace(" active", "");

                        if($targetPage.nextElementSibling){
                            clearInterval(intervalId);
                            $drawBtn.className = $drawBtn.className.replace(" isDrawed", "");
                            that.setPrizeImage();
                            that.setCardBackImage();
                            that.events();
                            $targetPage.nextElementSibling.style.left = -bodyWidth + "px";
                            this.previousElementSibling.className += " active";
                        }else{
                            that.turnGalaxy(initLowerTime);
                            $prizeTitle.style.marginRight = -$prizeTitle.offsetWidth + "px";
                            $winnerWrapper.innerHTML = '<li id="drawing-loading"><i class="fa fa-spin fa-spinner"></i> 等待开奖...</li>';
                            $targetPage.previousElementSibling.style.left = -bodyWidth + "px";
                            this.nextElementSibling.className += " active";
                        }
                    }
                }
            };

            //奖品hover
            this.prizeHoverHandler = function(){
                var el = $prizeWrapper.children;

                for(var i = 0; i < el.length; i++){
                    el[i].onmouseover = (function(){
                        return function (){
                            this.className += " hovered";
                            this.showImage = function(){
                                this.className += " showed";
                                this.style.backgroundImage = "";
                                this.showImage = null;
                            };

                            this.timeOut = setTimeout(function(){
                                this.showImage();
                            }.bind(this), 300)
                        };
                    })();

                    el[i].onmouseout = (function(i){
                        return function (){
                            if(this.showImage){
                                clearTimeout(this.timeOut);
                                this.showImage();
                            }
                            this.className = this.className.replace(" hovered showed", "");
                            this.style.backgroundImage = "url(./image/"+ i +".jpg)";
                        }
                    })(i);

                    el[i].onclick = function(){
                        var data = JSON.stringify({
                                        name: this.getAttribute("data-name"),
                                        src: this.getAttribute("data-src"),
                                        level: this.getAttribute("data-level"),
                                        num: this.getAttribute("data-num")
                                    }),
                            $centerPirzeImg = $lotteryPage.children[1].children[0],
                            $prizeName = document.getElementsByClassName("list-prize-name")[0];

                        localStorage.setItem("curDraw", data);
                        $centerPirzeImg.setAttribute("src", "image/" + this.getAttribute("data-src"));
                        $prizeName.innerHTML = this.getAttribute("data-name");
                        $winnerWrapper.innerHTML = '<li id="drawing-loading"><i class="fa fa-spin fa-spinner"></i> 等待出奖...</li>';

                        guides[0].onclick();

                        if(!this.className.match("isDrawed")){
                            if($drawBtn.className.match("isDrawed")){
                                $drawBtn.className = $drawBtn.className.replace(" isDrawed", "")
                            }
                            $audio.volume = 0.7;
                        }else{
                            that.setWinnerNum();
                        }
                    };
                }
            };

            //单次抽奖
            this.drawPrize = function(){
                var el = document.getElementsByClassName("btn-add");

                for(var i = 0; i < el.length; i++){
                    el[i].onclick = function(e){
                        var times = 1;

                        that.turnGalaxy();
                        that.setWinnerNum(times, this.getAttribute("data-index"));
                        that.runSingleOne(times, this.getAttribute("data-index"));
                    }
                }
            };

            //查看总列表
            this.allListClick = function(){
                var $target = document.getElementsByClassName("all-winnnerList")[0],
                    $list = document.getElementsByClassName("all-list-view")[0],
                    $close = document.getElementsByClassName("close-list")[0];

                $list.onclick = function(){
                    var $tbody = document.getElementById("all-winner-list-tbody"),
                        local = localStorage.getItem("winnerObject"),
                        data = JSON.parse(local),
                        html = "";

                    $target.className += " active";
                    $tbody.innerHTML = "";
                    for(var i = 0 ; i < data.length; i++){
                        var tb = [],
                            w = data[i].winner.split(",");

                        for(var k in data[i].waittingObject){
                            tb.push(w[parseInt(k)] + "—" + data[i].waittingObject[k])
                        }

                        html += '<tr><td>'+ (i + 1) +'</td><td>'+ data[i].name +'</td><td>'+ data[i].winner +'</td><td>'+ tb.join('<br/>') +'</td></tr>'
                    }
                    $tbody.innerHTML = html;
                    $target.style.top = (bodyHeight - $target.offsetHeight) / 2 + "px";
                };


                //关闭所有列表
                $close.onclick = function(){
                    $target.className = $target.className.replace(" active", "");
                    $target.style.top = -999 + "px";
                }
            };

            //清空localstorage
            this.clearStorage = function(){
                var el = document.getElementsByClassName("clear-storage")[0];

                el.onclick = function(){
                    var con = confirm("数据清除后将无法找回，确定要清除数据？");

                    if(con){
                        localStorage.clear();
                        location.reload();
                    }else{
                        return;
                    }
                }
            };

            //点击开奖抽奖
            this.startDraw = function(){
                var el = document.getElementsByClassName("btn-start")[0];

                el.onclick = function(){
                    var curPrize = JSON.parse(localStorage.getItem("curDraw")),
                        level = Math.abs(curPrize.level) ? Math.abs(curPrize.level) : 1,
                        time = Math.floor(8000 / level);

                    that.setWinnerNum();
                    if(!this.className.match("isDrawed")){
                        this.className += " isDrawed";
                        that.turnGalaxy();

                        setTimeout(function(){
                            that.runSingleOne();
                            $audio.volume = 1;
                        }, time);
                    }else{
                        that.drawGalaxy();
                        that.turnGalaxy(initLowerTime);
                    }
                }
            };

            //播放控件
            this.audioControl = function(){
                $audio.onmouseover = function(){
                    this.style.opacity = "1"
                };

                $audio.onmouseout = function(){
                    this.style.opacity = "0"
                }
            };


            this.guideClick();
            this.prizeHoverHandler();
            this.drawPrize();
            this.allListClick();
            this.clearStorage();
            this.startDraw();
            this.audioControl();
        },
        render: function(){
            document.body.style.height = bodyHeight + "px";
            $lotteryPage.style.left = -bodyWidth + "px";
            $audio.volume = 0.4;

            this.setPrizeImage();
            this.setCardBackImage();
            this.getBrowserInfo();
            this.getWinnerList(); //获取中奖名单
            this.setPrizeHeight();
            // this.drawGalaxy();
            // this.turnGalaxy();
            this.events();
        }
    };

    App.render()
})();