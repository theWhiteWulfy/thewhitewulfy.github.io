
document.getElementById('close').onmousedown = function(e) {
  e.preventDefault();
  document.getElementById('info').style.display = 'none';
  return false;
};

var two_PI = Math.PI * 2;

window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };

//-------------------------------------------------

var Vector = function(x, y) {

  this.x = x || 0;
  this.y = y || 0;
}

Vector.prototype.sub = function(v) {

  if (v.x != null && v.y != null) {

    this.x -= v.x;
    this.y -= v.y;

  } else {

    this.x -= v;
    this.y -= v;
  }

  return this;
};

Vector.prototype.add = function(v) {

  if (v.x != null && v.y != null) {

    this.x += v.x;
    this.y += v.y;

  } else {

    this.x += v;
    this.y += v;
  }

  return this;
};

Vector.prototype.mul = function(v) {

  if (v.x != null && v.y != null) {

    this.x *= v.x;
    this.y *= v.y;

  } else {

    this.x *= v;
    this.y *= v;
  }

  return this;
};

Vector.prototype.div = function(v) {

  if (v.x != null && v.y != null) {

    this.x /= v.x;
    this.y /= v.y;

  } else {

    this.x /= v;
    this.y /= v;
  }

  return this;
};

Vector.prototype.normalize = function() {

  var length = this.length();

  if (length > 0) {
    this.x /= length;
    this.y /= length;
  }

  return this;
};

Vector.prototype.length = function() {

  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.distance = function(v) {

  var x = this.x - v.x;
  var y = this.y - v.y;

  return Math.sqrt(x * x + y * y);
};

Vector.prototype.reset = function() {

  this.x = 0;
  this.y = 0;

  return this;
};

Vector.prototype.neg = function() {

  this.x *= -1;
  this.y *= -1;

  return this;
};

Vector.add = function(v1, v2) {

  if (v2.x != null && v2.y != null) {

    return new Vector(
      v1.x + v2.x,
      v1.y + v2.y);

  } else {

    return new Vector(
      v1.x + v2,
      v1.y + v2);
  }
};

Vector.sub = function(v1, v2) {

  if (v2.x != null && v2.y != null) {

    return new Vector(
      v1.x - v2.x,
      v1.y - v2.y);

  } else {

    return new Vector(
      v1.x - v2,
      v1.y - v2);
  }
};

Vector.mul = function(v1, v2) {

  if (v2.x != null && v2.y != null) {

    return new Vector(
      v1.x * v2.x,
      v1.y * v2.y);

  } else {

    return new Vector(
      v1.x * v2,
      v1.y * v2);
  }
};

Vector.div = function(v1, v2) {

  if (v2.x != null && v2.y != null) {

    return new Vector(
      v1.x / v2.x,
      v1.y / v2.y);

  } else {

    return new Vector(
      v1.x / v2,
      v1.y / v2);
  }
};

//-------------------------------------------------

var Point = function(x, y, fixed) {

  this.pos = new Vector(x, y);
  this.pre = new Vector(x, y);
  this.acc = new Vector();

  this.fixed = fixed;
};

Point.prototype.move = function(v) {

  if (this.fixed) return;

  this.pos.add(v);
};

Point.prototype.add_force = function(v) {

  if (this.fixed) return;

  this.acc.add(v);
};

Point.prototype.update = function(delta) {

  if (this.fixed) return;

  delta *= delta;

  var x = this.pos.x,
    y = this.pos.y;

  this.acc.mul(delta);

  this.pos.x += x - this.pre.x + this.acc.x;
  this.pos.y += y - this.pre.y + this.acc.y;

  this.acc.reset();

  this.pre.x = x;
  this.pre.y = y;
};

Point.prototype.check_walls = function(x, y, w, h) {

  this.pos.x = Math.max(x + 1, Math.min(w - 1, this.pos.x));
  this.pos.y = Math.max(y + 1, Math.min(h - 1, this.pos.y));

  if (this.pos.y >= h - 1)
    this.pos.x -= (this.pos.x - this.pre.x + this.acc.x);
};

Point.prototype.draw = function(ctx, size) {

  if (this.fixed) {

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, size * 3, 0, two_PI, false);
    ctx.fill();
  }

  ctx.fillStyle = (this.fixed) ? '#EDEA26' : '#aaa';
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, size, 0, two_PI, false);
  ctx.fill();
};

//-------------------------------------------------

var Constraint = function(p1, p2) {

  this.p1 = p1;
  this.p2 = p2;
  this.length = p1.pos.distance(p2.pos);
  this.stretch = this.length * 0.15;
}

Constraint.prototype.resolve = function() {

  var dists = Vector.sub(this.p2.pos, this.p1.pos),
    length = dists.length(),
    diff = length - this.length;

  dists.normalize();

  var f = dists.mul(diff * 0.5);

  this.p1.move(f);
  this.p2.move(f.neg());
};

Constraint.prototype.draw = function(ctx, stress) {

  if (stress) {

    var diff = this.length - this.p1.pos.distance(this.p2.pos);

    var per = Math.round(Math.min(Math.abs(diff / this.stretch), 1) * 255);

    ctx.strokeStyle = 'rgba(255, ' + (255 - per) + ', ' + (255 - per) + ', 0.8)';

  } else ctx.strokeStyle = 'rgba(255,255,255,0.8)';

  ctx.beginPath();
  ctx.moveTo(this.p1.pos.x, this.p1.pos.y);
  ctx.lineTo(this.p2.pos.x, this.p2.pos.y);
  ctx.stroke();
};

//-------------------------------------------------

var JSVerlet = function(canvas, options) {

  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.ctx.lineWidth = 1;

  this.width = canvas.width;
  this.height = canvas.height;
  this.options = options || {};

  this.constraints = [];
  this.points = [];
  this.draw_points = [];

  this.mouse = new Vector();
  this.gravity = this.options.gravity || new Vector(0, 0.98);
  this.point_size = this.options.point_size || 2;
  this.show_stress = this.options.show_stress;

  this.key = {
    ctrl: false,
    alt: false
  };

  canvas.oncontextmenu = function(e) {

    e.preventDefault();
  };

  var _this = this;

  if (this.options.edit) {

    document.onkeydown = function(e) {

      if (e.keyCode == 17) {

        _this.key.ctrl = true;

      } else if (e.keyCode == 16) {

        _this.draw_points = [];

      } else if (e.keyCode == 18) {

        _this.key.alt = true;
      }
    };

    document.onkeyup = function(e) {

      if (e.keyCode == 17) {

        _this.key.ctrl = false;
        _this.draw_points = [];

      } else if (e.keyCode == 18) {

        _this.key.alt = false;
      }
    };
  }

  if (this.options.edit || this.options.drag) {

    canvas.onmousedown = function(e) {

      var rect = _this.canvas.getBoundingClientRect();
      _this.mouse.x = e.clientX - rect.left;
      _this.mouse.y = e.clientY - rect.top;

      _this.mouse.down = true;

      if (_this.options.edit) {

        if (e.which == 3) {

          if (_this.get_mouse_point())
            _this.remove_point(_this.get_mouse_point())

        } else {

          if (_this.key.ctrl) {

            var p = _this.get_mouse_point();

            if (!p) {

              p = new Point(_this.mouse.x, _this.mouse.y, _this.key.alt);
              _this.points.push(p);
            }

            if (_this.draw_points.length) {

              _this.constraints.push(
                new Constraint(
                  p,
                  _this.draw_points[_this.draw_points.length - 1]
                )
              );
            }

            _this.draw_points.push(p);

          } else if (_this.options.drag)
            _this.mouse_point = _this.get_mouse_point();
        }

      } else if (_this.options.drag)
        _this.mouse_point = _this.get_mouse_point();
    };

    canvas.onmouseup = function(e) {

      _this.mouse.down = false;
      _this.mouse_point = null;
    };

    canvas.onmousemove = function(e) {

      var rect = _this.canvas.getBoundingClientRect();
      _this.mouse.x = e.clientX - rect.left;
      _this.mouse.y = e.clientY - rect.top;
    };
  }
};

JSVerlet.prototype.draw = function(ctx) {

  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  var i = this.constraints.length;
  while (i--) this.constraints[i].draw(ctx, this.show_stress);

  var i = this.points.length;
  while (i--) this.points[i].draw(ctx, this.point_size);

  if (this.mouse_point) {

    ctx.beginPath();
    ctx.arc(this.mouse_point.pos.x, this.mouse_point.pos.y, this.point_size * 3, 0, two_PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.mouse_point.pos.x, this.mouse_point.pos.y, this.point_size, 0, two_PI);
    ctx.fillStyle = (this.mouse_point.fixed) ? '#EDEA26' : '#aaa';
    ctx.fill();
  }

  if (this.draw_points.length) {

    var point = this.draw_points[this.draw_points.length - 1];

    ctx.beginPath();
    ctx.arc(point.pos.x, point.pos.y, this.point_size * 3, 0, two_PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(point.pos.x, point.pos.y, this.point_size, 0, two_PI);
    ctx.fillStyle = '#aaa';
    ctx.fill();
  }
};

JSVerlet.prototype.update = function(iter) {

  if (this.key.ctrl) return;

  iter = iter || 6;

  var delta = 1 / iter;

  var n = iter;
  while (n--) {

    if (this.mouse_point) {

      this.mouse_point.pos.x += (this.mouse.x - this.mouse_point.pos.x) / iter;
      this.mouse_point.pos.y += (this.mouse.y - this.mouse_point.pos.y) / iter;
    }

    var i = this.points.length;
    while (i--) {

      var point = this.points[i];
      point.add_force(this.gravity);
      point.update(delta);
      point.check_walls(0, 0, this.width, this.height);
    }

    var i = this.constraints.length;
    while (i--) this.constraints[i].resolve();
  }
};

JSVerlet.prototype.remove_point = function(point) {

  var i = this.constraints.length;
  while (i--) {

    var constraint = this.constraints[i];
    if (constraint.p1 == point || constraint.p2 == point)
      this.constraints.splice(this.constraints.indexOf(constraint), 1);
  }

  if (this.points.indexOf(point) != -1)
    this.points.splice(this.points.indexOf(point), 1);
};

JSVerlet.prototype.get_mouse_point = function() {

  var closest;

  var i = this.points.length;

  while (i--) {

    var point = this.points[i];

    if (point.pos.distance(this.mouse) < 10) {

      closest = point;
    }
  }

  return closest;
};

JSVerlet.prototype.add_point = function(x, y, fixed) {

  var point = new Point(x, y, fixed);

  this.points.push(point);

  return point;
};

JSVerlet.prototype.add_constraint = function(p1, p2) {

  this.constraints.push(new Constraint(p1, p2));
};

JSVerlet.prototype.add_shape = function(shapes) {

  if (!(shapes instanceof Array)) {

    if (!(shapes instanceof Shape)) {

      console.log('Error: shape is not an instance of Shape.');
      return false;
    }

    this.points = this.points.concat(shapes.points);
    this.constraints = this.constraints.concat(shapes.constraints);

    return true;
  }

  var i = shapes.length;

  while (i--) {

    var shape = shapes[i];

    if (!(shape instanceof Shape)) {

      console.log('Error: shape[' + i + '] is not an instance of Shape.');
      return false;
    }

    this.points = this.points.concat(shape.points);
    this.constraints = this.constraints.concat(shape.constraints);
  }

  return true;
};

//-------------------------------------------------

var Shape = function() {};

//-------------------------------------------------

var Rectangle = function(x, y, w, h) {

  var p1 = new Point(x, y);
  var p2 = new Point(x + w, y);
  var p3 = new Point(x, y + h);
  var p4 = new Point(x + w, y + h);

  var c1 = new Constraint(p1, p2);
  var c2 = new Constraint(p2, p3);
  var c3 = new Constraint(p3, p4);
  var c4 = new Constraint(p4, p1);
  var c5 = new Constraint(p1, p3);
  var c6 = new Constraint(p2, p4);

  this.points = [p1, p2, p3, p4];
  this.constraints = [c1, c2, c3, c4, c5, c6];
};

Rectangle.prototype = new Shape();

//-------------------------------------------------

window.onload = function() {

  var canvas = document.getElementById('c');
  canvas.width = 1000; //window.innerWidth;
  canvas.height = 340; //window.innerHeight;
  var ctx = canvas.getContext('2d');

  var jsv = new JSVerlet(canvas, {
    drag: true,
    edit: true,
    show_stress: true
  });

  // demo scene ------------------------------

  var p1 = jsv.add_point(90, 40, false),
    p2 = jsv.add_point(160, 40, false),
    p3 = jsv.add_point(90, 110, false),
    p4 = jsv.add_point(160, 110, false),
    p5 = jsv.add_point(90, 180, false),
    p6 = jsv.add_point(160, 180, false),
    p7 = jsv.add_point(90, 250, false),
    p8 = jsv.add_point(160, 250, false),
    p9 = jsv.add_point(90, 320, true),
    p10 = jsv.add_point(160, 320, true),
    p11 = jsv.add_point(300, 40, false),
    p12 = jsv.add_point(365, 198, false),
    p13 = jsv.add_point(345, 218, false),
    p14 = jsv.add_point(385, 218, false);

  jsv.add_constraint(p1, p2);
  jsv.add_constraint(p3, p4);
  jsv.add_constraint(p5, p6);
  jsv.add_constraint(p7, p8);
  jsv.add_constraint(p1, p3);
  jsv.add_constraint(p3, p5);
  jsv.add_constraint(p5, p7);
  jsv.add_constraint(p7, p9);
  jsv.add_constraint(p2, p4);
  jsv.add_constraint(p4, p6);
  jsv.add_constraint(p6, p8);
  jsv.add_constraint(p8, p10);
  jsv.add_constraint(p1, p4);
  jsv.add_constraint(p2, p3);
  jsv.add_constraint(p3, p6);
  jsv.add_constraint(p4, p5);
  jsv.add_constraint(p5, p8);
  jsv.add_constraint(p6, p7);
  jsv.add_constraint(p7, p10);
  jsv.add_constraint(p8, p9);
  jsv.add_constraint(p2, p11);
  jsv.add_constraint(p4, p11);
  jsv.add_constraint(p11, p12);
  jsv.add_constraint(p12, p13);
  jsv.add_constraint(p12, p14);
  jsv.add_constraint(p13, p14);

  jsv.add_shape(new Rectangle(500, 70, 70, 70));

  var square = new Rectangle(630, 70, 50, 50);

  square.points[1].fixed = true;

  jsv.add_shape(square);

  //----------------------------------------

  var Loop = function() {

    //var time = new Date().getTime();

    jsv.update(16);
    jsv.draw(ctx);

    //console.log(new Date().getTime() - time);

    requestAnimFrame(Loop);
  };

  Loop();
};