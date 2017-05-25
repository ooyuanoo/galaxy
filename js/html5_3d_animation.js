var html5_3d_animation = function(ctx){
    var p=p||{};

    var w_w= document.body.scrollWidth;
    var w_h= navigator.userAgent.toLowerCase().match("chrome") ? document.body.scrollHeight : document.documentElement.scrollHeight;
    var w_b= "#00113F";
    var s_c= '1000';
    var s_color= '#fff';
    var s_d= '100';
    //var dom = document.body;
    var fov = parseInt(s_d);
    var SCREEN_WIDTH = parseInt(w_w);
    var SCREEN_HEIGHT = parseInt(w_h);
    var HALF_WIDTH = SCREEN_WIDTH/2;
    var HALF_HEIGHT = SCREEN_HEIGHT/2;
    var c_id = "star-canvas";
    var numPoints = s_c;
    //dom.setAttribute("width", w_w);
    //dom.setAttribute("height", w_h);
    setup();
    function setup() {
        function draw3Din2D(point3d) {
            x3d = point3d[0];
            y3d = point3d[1];
            z3d = point3d[2];
            var scale = fov/(fov+z3d);
            var x2d = (x3d * scale) + HALF_WIDTH;
            var y2d = (y3d * scale)  + HALF_HEIGHT;

            c.lineWidth= scale;
            c.strokeStyle = s_color;
            c.beginPath();
            c.moveTo(x2d,y2d);
            c.lineTo(x2d+scale,y2d);
            c.stroke();
        }

        var canvas = document.getElementById(c_id);
        var c = canvas.getContext('2d');

        canvas.width = w_w;
        canvas.height = w_h;

        var points = [];

        function initPoints() {
            for (i=0; i<numPoints; i++) {
                point = [(Math.random()*400)-200, (Math.random()*400)-200 , (Math.random()*400)-200 ];
                points.push(point);
            }
        }

        function render() {
            var radial = c.createRadialGradient(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH / 100, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH / 2 - SCREEN_WIDTH / 8);
            // c.fillStyle=w_b;
            radial.addColorStop(0, 'rgb(135,77,115)');
            radial.addColorStop(1, '#010125');
            c.fillStyle = radial;
            c.fillRect(0,0, SCREEN_WIDTH, SCREEN_HEIGHT);

            for (i=0; i<numPoints; i++) {
                point3d = points[i];

                z3d = point3d[2];
                z3d-=4;
                if(z3d<-fov) z3d +=400;
                point3d[2] = z3d;


                draw3Din2D(point3d);
            }
            //var show = document.getElementById('show');
            //show.appendChild('p');
        }

        initPoints();

        var loop = setInterval(function(){
            render();
        }, 100);
    }
};
html5_3d_animation();