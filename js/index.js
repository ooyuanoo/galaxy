/**
 * Created by yuan on 2016/12/25.
 */
'use strict';
var Setting = function(){
    this.prizeLevelSize = {
        1: 1,
        2: 2,
        3: 3,
        4: 5,
        5: 10,
        6: 15
    };
    this.numOfPeople = 150;
};
var Config = new Setting();

(function(){
    var bodyHeight,
        bodyWidth = document.body.scrollWidth,
        $content = document.getElementsByClassName("content")[0],
        $box = document.getElementsByClassName("global-box-wrapper")[0],
        $global = document.getElementsByClassName("global")[0],
        $globalBox = document.getElementsByClassName("ball-box")[0],
        initLeft = ($box.offsetWidth - $box.offsetWidth * .57) / 2 - 30,
        initBottom = 3,
        ballLevel = 1;

    var App = {
        getBrowserInfo: function(){
            var agent = navigator.userAgent.toLowerCase();

            if(agent.match("msie") || (agent.match("windows nt 6.1;") && agent.match("trident/7.0;"))){
                bodyHeight = document.documentElement.scrollHeight;
                return {type: "IE", version: agent}
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
        setContainerSize: function(){
            $content.style.height = bodyHeight + "px";
            $content.style.width = bodyWidth + "px";
        },
        setGlobalBoxSize: function(){
            $box.style.height = $box.offsetWidth + "px";
            $box.style.top = (bodyHeight - bodyHeight * 2 / 3) / 2 + "px"
        },
        setBoxBottom: function(){
            var $bottom = document.getElementsByClassName("start-prize-draw")[0];

            $bottom.style.borderBottomWidth = $bottom.offsetHeight + "px";
            $bottom.style.borderBottomStyle = "solid";
            $bottom.style.borderBottomColor = "#8e0f0f";

            $bottom.style.borderLeftWidth = $box.offsetWidth * .213 + "px";
            $bottom.style.borderLeftStyle = "solid";
            $bottom.style.borderLeftColor = "transparent";

            $bottom.style.borderRightWidth = $box.offsetWidth * .213 + "px";
            $bottom.style.borderRightStyle = "solid";
            $bottom.style.borderRightColor = "transparent";
        },
        ballTemplate: function(bgColor, no){
            var width = document.getElementsByClassName("ball-box")[0].offsetWidth * 0.1,
                lineHeight = width + "px",
                bground = "";

            if(initLeft > $box.offsetWidth * .57 + ballLevel * 12 - 10){
                initLeft = 60 - width / 2 * ballLevel + ballLevel * (width / 4) ;

                if(ballLevel >= 6){
                    initLeft = 60 - width / 2 * (ballLevel - 1) + ballLevel * (width / 4);
                    console.log(initLeft);
                }

                initBottom += width / 4;
                ballLevel++;
            }else{
                if(no != 1){
                    initLeft += width;
                }
            }

            for(var i = 0; i < bgColor.length; i++){
                bground += "background: " + bgColor[i] + ";"
            }

            return '<span class="ball ball-'+ no +'" data-id="'+ no +'" style="'+ bground +'; line-height: '+ lineHeight +'; left: '+ initLeft +'px; bottom: '+ initBottom +'px; z-index:'+ Math.floor(Math.random() * 10) +'">' + no + '</span>';
        },
        setBalls: function(){
            var el = "";

            for(var i = 0; i < Config.numOfPeople; i++){
                var bgColor = [
                        "-webkit-radial-gradient(top left, circle, rgb(255,255,255) 10%, rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + "))",
                        "-moz-radial-gradient(top left, circle, rgb(255,255,255) 10%, rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + "))",
                        "-o-radial-gradient(top left, circle, rgb(255,255,255) 10%, rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + "))",
                        "-ms-radial-gradient(top left, circle, rgb(255,255,255) 10%, rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + "))",
                        "radial-gradient(top left, circle, rgb(255,255,255) 10%, rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + "))"
                    ];

                el += this.ballTemplate(bgColor, i + 1);
            }

            $globalBox.innerHTML = el;
        },
        turnTheBall: function(){
            var maxHeight = $globalBox.offsetHeight,
                maxWidth = $globalBox.offsetWidth;

            for(var i = 0; i < Config.numOfPeople; i++){
                var el = document.getElementsByClassName("ball-" + (i + 1))[0];

                el.style.bottom = Math.random() * maxHeight + "px";
                el.style.left = Math.random() * maxWidth + "px";
                el.style.zIndex = Math.random() * 10
            }
        },
        events: function(){
            var btn = document.getElementsByClassName("btn-start")[0],
                that = this;

            btn.onclick = function(e){
                var $this = e.target;

                $this.setAttribute("class", $this.getAttribute("class") + " active");
                $this.innerText = "正在抽奖";
                that.turnTheBall();
                setInterval(function(){
                    that.turnTheBall();
                }, 150);
            }
        },
        render: function(){
            this.getBrowserInfo();
            this.setContainerSize();
            this.setGlobalBoxSize();
            // this.setBoxBottom();
            this.setBalls();
            this.events();
        }
    };

    App.render();

}());