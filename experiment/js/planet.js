
document.getElementById('close').onmousedown = function(e) {
  e.preventDefault();
  document.getElementById('info').style.display = 'none';
  return false;
};

var planet, canvas, ctx, water = [],
	trees = [],
	clouds = [];

var settings = {
 
	atmosphere_height: 70,
	atmosphere_growth: 0.0002,
	atmosphere_max: 0.1,
	gravity: 0.3,
	soak_rate: 0.05,
	cool_rate: 0.5,
	melt_rate: 0.01,
	dry_rate: 0.01,
	max_trees: 20,
	tree_spread: 18,
	spin_rate: 0.1,
	growth_rate: 0.1,
	tree_height: 18,
	branch_size: 6,
	branch_growth: 0.3,
	max_fruit: 1,
	fruit_rot: 1000,
	fruit_growth: 0.02,
	fruit_age: 400,
	fruit_size: 2,
	fruit_gravity: 0.5,
	freeze_rate: 0.1,
	snow_height: 2,
	drown_time: 100,
	cloud_chance: 2000,
	fade_rate: 0.01,
	cloud_cutoff: 15,
	rain_time: 70,
	rain_rate: 10,

	water_colour: 'rgba(40, 160, 220, 0.4)',
	cold_core_colour: '#A1A1A1',
	core_colour: '#FCCD49',
	wet_soil_colour: '#7A4500',
	tree_colour: '#8F5424',
	branch_colours: ['#83DE28', '#ABCF51', '#9BD604', '#76C967', '#3D942E'],
	branch_dead_colour: '#C29D38',
	fruit_colours: ['#FF0000', '#DE1F6C', '#E87E46', '#DE4112', '#F27F1B'],
	rotten_fruit_colour: 'rgba(131, 179, 0,'
};

var Loop = function() {

	//var time = new Date().getTime();

	ctx.clear();

	var i = water.length;
	while (i--) {
		if (water[i].update()) water[i].draw();
	}

	planet.update();
	planet.draw();

	var i = trees.length;
	while (i--) {
		trees[i].update();
		trees[i].draw();
	}

	var i = clouds.length;
	while (i--) {
		if (clouds[i].update()) clouds[i].draw();
	}

	//console.log(new Date().getTime() - time);
};

var Utils = {

	circle_angle: function(x, y, r, a) {
		var xc = Math.cos(a * (Math.PI / 180)) * r + x;
		var yc = Math.sin(a * (Math.PI / 180)) * r + y;
		return {
			x: xc,
			y: yc
		};
	},

	alter_angle: function(a, n) {
		var angle = a + n;
		if (angle < 0) angle = 360 + angle;
		if (angle > 360) angle = angle - 360;
		return angle;
	},

	in_angle: function(angle1, angle2, range) {
		var diff = angle1 - angle2;

		return Math.abs(diff % 360) <= range || (360 - Math.abs(diff % 360)) <= range;
	},

	chance: function(number) {
		return (Math.random() * number < 1);
	},

	distance: function(point1, point2) {
		return (Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)));
	},

	random: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};

var Planet = function(x, y, r) {

	this.x = x;
	this.y = y;
	this.r = r;

	this.colour = '#BF6D02';

	this.water_level = r;
	this.water_depth = r;
	this.snow_level = r;
	this.core_size = r / 3;
	this.atmosphere = 0;

	this.frozen = false;
};

Planet.prototype.addTree = function() {

	var angle = Math.floor(Math.random() * 360);

	for (var i = 0; i < trees.length; i++) {

		var tree = trees[i];

		if (Utils.in_angle(angle, tree.angle, settings.tree_spread)) return;
	}

	trees.push(
	new Tree(angle));
};

Planet.prototype.update = function() {

	if (this.core_size > 0) {

		if (this.water_level > this.r) {

			this.water_level = Math.max(this.water_level - settings.soak_rate, this.r);
			this.water_depth = Math.max(this.water_depth - settings.soak_rate, 0);
		}

		if (this.water_depth < this.r) {

			if (trees.length < settings.max_trees && this.core_size && this.water_level <= this.r) {

				if (this.atmosphere < settings.atmosphere_max) this.atmosphere += settings.atmosphere_growth;

				if (Utils.chance(200)) {
					this.addTree();
				}
			}

			this.water_depth += settings.dry_rate;
		}

		if (this.water_depth <= this.core_size) this.core_size -= settings.cool_rate;

		else if (this.core_size < this.r / 3 && this.core_size > 0) this.core_size += settings.melt_rate;

	} else {

		this.frozen = true;

		if (this.water_level > this.r) {

			this.water_level = Math.max(this.water_level - settings.soak_rate, this.r);
			this.water_depth = Math.max(this.water_depth - settings.soak_rate, 0);

			if (this.snow_level > this.r) {
				this.snow_level = Math.max(this.snow_level - settings.freeze_rate, this.r);
			}

		} else {

			if (this.snow_level <= this.water_level + settings.snow_height) this.snow_level += settings.freeze_rate;

			else if (this.snow_level > this.water_level + 4) this.snow_level -= settings.freeze_rate;
		}
	}

	if (this.atmosphere >= settings.atmosphere_max) {

		if (Utils.chance(settings.cloud_chance)) {

			clouds.push(
			new Cloud(this));
		}
	}
};

Planet.prototype.draw = function(middle) {

	if (this.atmosphere > 0) {

		ctx.circle(
		this.x,
		this.y,
		this.r + settings.atmosphere_height,
			'rgba(70, 180, 240, ' + this.atmosphere.toFixed(2) + ')');
	}

	if (this.snow_level > this.r) {

		ctx.circle(
		this.x,
		this.y,
		this.snow_level,
			'#FFF');
	}

	if (this.water_level > this.r) {

		ctx.circle(
		this.x,
		this.y,
		this.water_level,
		settings.water_colour);
	}

	if (this.water_depth < this.r) {

		ctx.circle(
		this.x,
		this.y,
		this.r,
		settings.wet_soil_colour);

		ctx.circle(
		this.x,
		this.y,
		this.water_depth,
		this.colour);

	} else {

		ctx.circle(
		this.x,
		this.y,
		this.r,
		this.colour);
	}

	if (this.core_size < this.r / 3) {

		ctx.circle(
		this.x,
		this.y,
		this.r / 3,
		settings.cold_core_colour);
	}

	if (this.core_size > 0) {

		ctx.circle(
		this.x,
		this.y,
		this.core_size,
		settings.core_colour);
	}
};

//---------------------------------------------------------

var Water = function(x, y, r, snow, gravity) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.vx = 0;
	this.vy = 0;
	this.absorb = false;
	this.snow = snow || false;
	this.gravity = gravity || settings.gravity;
};

Water.prototype.update = function() {

	var _this = this;

	if (this.r < 1) {
		water.splice(water.indexOf(this), 1);
		return false;
	}

	if (this.absorb) {

		this.r -= 1;

		if (planet.water_level < planet.r + settings.atmosphere_height) planet.water_level += 0.2;

		return false;
	}

	var dist = Utils.distance(this, planet);
	var dist_x = planet.x - this.x;
	var dist_y = planet.y - this.y;

	var cos = dist_x / dist;
	var sin = dist_y / dist;

	var force = this.gravity * ((this.r * 2) * (planet.r * 2)) / Math.pow(dist, 2);

	this.vx += (cos * force);
	this.vy += (sin * force);

	if (dist < planet.r - this.r) {

		if (!this.snow) this.absorb = true;
		else this.r = 0;
	}

	this.x += this.vx;
	this.y += this.vy;

	return true;
};

Water.prototype.draw = function() {

	if (this.absorb) return;

	var colour = (this.snow) ? "#FFF" : settings.water_colour;

	ctx.circle(this.x, this.y, this.r, colour);
};

//--------------------------------------------------------------------

var Tree = function(angle) {

	this.angle = angle;
	this.height = 0;
	this.max_height = settings.tree_height + Math.random() * 4;
	this.branches = [];
	this.width = 3;
	this.dying = 0;
	this.dead = false;
	this.colour = settings.branch_colours[Math.floor(Math.random() * settings.branch_colours.length)];
};

Tree.prototype.addBranch = function() {

	var angle = (this.branches.length * 3 > 3) ? -3 : this.branches.length * 3;
	var dist = (this.branches.length > 0) ? 1.5 : 1;

	this.branches.push(
	new Branch(
	this,
	angle,
	planet.r + (this.height / dist)));
};

Tree.prototype.update = function() {

	this.angle = Utils.alter_angle(this.angle, settings.spin_rate);

	if (this.dying > settings.drown_time) this.dead = true;

	if (this.dead) return;

	if (!planet.core_size || planet.water_depth >= planet.r) {
		this.dying += 0.01;
		return;
	}

	if (planet.water_level <= planet.r + this.height) {

		this.dying = 0;

		if (this.height < this.max_height) {
			this.height += settings.growth_rate;
		}

		if (this.height >= this.max_height && this.branches.length < 3) {

			if (!this.branches.length || this.branches[this.branches.length - 1].grown) this.addBranch();
		}

	} else if (this.height > 2) this.dying++;
};

Tree.prototype.draw = function() {

	ctx.shape(
	[
	Utils.circle_angle(
	planet.x,
	planet.y,
	planet.r,
	Utils.alter_angle(this.angle, -this.width)),
	Utils.circle_angle(
	planet.x,
	planet.y,
	planet.r + this.height,
	this.angle),
	Utils.circle_angle(
	planet.x,
	planet.y,
	planet.r,
	Utils.alter_angle(this.angle, this.width))],
	settings.tree_colour);

	var i = this.branches.length;
	while (i--) {
		this.branches[i].update();
		this.branches[i].draw();
	}
};

//-----------------------------------------------------

var Branch = function(tree, angle, dist) {
	this.tree = tree;
	this.r = 0;
	this.angle = angle;
	this.dist = dist;
	this.fruit = [];
	this.snow_height = 0;

	/* checks */
	this.snow = false;
	this.grown = false;
};

Branch.prototype.update = function() {

	var coord = Utils.circle_angle(
	planet.x,
	planet.y,
	this.dist,
	Utils.alter_angle(this.tree.angle, this.angle));

	this.x = coord.x;
	this.y = coord.y;

	if (planet.core_size <= 0 && planet.water_level < planet.r + this.tree.height) {

		this.snow = true;

		if (this.snow_height < settings.snow_height) this.snow_height += settings.freeze_rate;

		var coord = Utils.circle_angle(
		planet.x,
		planet.y,
		this.dist + this.snow_height,
		Utils.alter_angle(this.tree.angle, this.angle));

		this.snowx = coord.x;
		this.snowy = coord.y;
	} else {

		if (this.snow_height > 0) {
			this.snow_height -= settings.freeze_rate;

			var coord = Utils.circle_angle(
			planet.x,
			planet.y,
			this.dist + this.snow_height,
			Utils.alter_angle(this.tree.angle, this.angle));

			this.snowx = coord.x;
			this.snowy = coord.y;
		} else this.snow = false
	}

	if (this.tree.dead) return;

	if (this.r < settings.branch_size) this.r += settings.branch_growth;
	else this.grown = true;

	if (this.grown && this.fruit.length < settings.max_fruit && planet.water_depth < planet.r) {

		if (Utils.chance(800)) {
			this.fruit.push(
			new Fruit(this));
		}
	}
};

Branch.prototype.draw = function() {

	if (this.snow) {

		ctx.circle(
		this.snowx,
		this.snowy,
		this.r,
			"#FFF");
	}

	ctx.circle(
	this.x,
	this.y,
	this.r, (this.tree.dead) ? settings.branch_dead_colour : this.tree.colour);

	var i = this.fruit.length;
	while (i--) {
		if (this.fruit[i].update()) this.fruit[i].draw();
	}
};

//---------------------------------------------------------------------

var Fruit = function(branch) {

	this.branch = branch;
	this.r = 0;
	this.age = 0;
	this.on_tree = true;
	this.vx = 0;
	this.vy = 0;
	this.rotten = false;
	this.alpha = 1;
	this.colour = settings.fruit_colours[Math.floor(Math.random() * settings.fruit_colours.length)];
};

Fruit.prototype.update = function() {

	if (this.on_tree) {

		if (this.age > settings.fruit_age) {

			this.on_tree = false;
			return true;
		}

		this.x = this.branch.x;
		this.y = this.branch.y;

		if (this.r < settings.fruit_size && !this.branch.tree.dead) this.r += settings.fruit_growth;
		else this.age++;

	} else {

		this.age++;

		if (this.age > settings.fruit_rot) {
			this.rotten = true;

			if (this.age > settings.fruit_rot + 1000) {

				this.alpha = Math.max(0, this.alpha - settings.fade_rate);

				if (this.alpha <= 0) {
					this.branch.fruit.splice(this.branch.fruit.indexOf(this), 1);
					return false;
				}
			}
		}

		var dist = Utils.distance(this, planet);
		var dist_x = -this.x + planet.x;
		var dist_y = -this.y + planet.y;
		var dist_real = dist - (this.r + planet.r);

		var cos = dist_x / dist;
		var sin = dist_y / dist;

		var force = settings.fruit_gravity * ((this.r * 2) * (planet.r * 2)) / Math.pow(dist, 2);

		if (dist < planet.water_level) {
			this.vx += (cos * force) / 3;
			this.vy += (sin * force) / 3;
		} else {
			this.vx += (cos * force);
			this.vy += (sin * force);
		}

		if (dist_real < 0) {
			this.x += (cos * (dist_real / 2));
			this.y += (sin * (dist_real / 2));
			this.vx += (cos * dist_real);
			this.vy += (sin * dist_real);

			if (dist > planet.water_level) {
				this.vx *= 0.8;
				this.vy *= 0.8;
			} else {
				this.vx *= 0.1;
				this.vy *= 0.1;
			}
		}

		var coord = Utils.circle_angle(
		planet.x,
		planet.y,
		dist,
		this.branch.tree.angle + this.branch.angle);

		this.x = coord.x;
		this.y = coord.y;

		this.x += this.vx;
		this.y += this.vy;
	}

	return true;
};

Fruit.prototype.draw = function() {

	var colour = (this.rotten) ? settings.rotten_fruit_colour + this.alpha + ')' : this.colour;
	ctx.circle(this.x, this.y, this.r, colour);
};

var Cloud = function() {

	this.angle = Math.floor(Math.random() * 360);
	this.parts = [];
	this.height = settings.atmosphere_height - (5 + Math.floor(Math.random() * 5));
	this.raining = false;
	this.rain = 0;
	this.dead = false;
	this.alpha = 0;
};

Cloud.prototype.update = function() {

	this.angle = Utils.alter_angle(this.angle, settings.spin_rate);

	if (planet.water_level > planet.r + settings.cloud_cutoff) this.dead = true;

	if (this.dead) {

		if (this.alpha <= 0) {
			clouds.splice(clouds.indexOf(this), 1);
			return false;
		}

		this.alpha = Math.max(0, this.alpha - settings.fade_rate);
		return true;

	} else {

		if (this.alpha < 0.6) {
			this.alpha = Math.min(1, this.alpha + settings.fade_rate);
		}
	}

	if (!this.parts.length) {

		for (var i = 0; i <= Utils.random(3, 10); i++) {
			this.parts.push({
				angle: this.angle + Utils.random(-3, 3),
				height: this.height + Utils.random(-2, 2),
				radius: Utils.random(3, 6)
			});
		}
	} else {

		if (Utils.chance(100)) this.raining = true;

		if (this.raining && Utils.chance(settings.rain_rate)) {
			var part = this.parts[Utils.random(0, this.parts.length - 1)];
			water.push(
			new Water(
			part.x + Utils.random(-part.radius * 0.5, part.radius * 0.5),
			part.y + Utils.random(-part.radius * 0.5, part.radius * 0.5),
			1.5,
			planet.frozen,
			settings.gravity * 5));
			this.rain++;
		}

		if (this.rain > settings.rain_time && Utils.chance(40)) {
			this.dead = true;
		}
	}

	return true;
};

Cloud.prototype.draw = function() {

	var i = this.parts.length;
	while (i--) {

		var part = this.parts[i];

		var coord = Utils.circle_angle(
		planet.x,
		planet.y,
		planet.r + part.height,
		this.angle + part.angle);

		part.x = coord.x;
		part.y = coord.y;

		ctx.circle(
		coord.x,
		coord.y,
		part.radius,
			'rgba(255, 255, 255,' + this.alpha + ')');

	}
};


window.onload = function() {
 

	canvas = document.getElementById('c');
	ctx = canvas.getContext('2d');
	canvas.width = 800;
	canvas.height = 376;

	ctx.circle = function(x, y, r, c) {
		this.beginPath();
		this.arc(
		x,
		y,
		r,
		0,
		Math.PI * 2);
		this.fillStyle = c;
		this.fill();
	};

	ctx.shape = function(points, c) {

		this.beginPath();

		this.moveTo(points[0].x, points[0].y);

		for (var i = 1, l = points.length; i < l; i++)
		this.lineTo(points[i].x, points[i].y)

		this.closePath();

		this.fillStyle = c;
		this.fill();
	};

	ctx.clear = function() {
		this.fillStyle = '#333';
		this.fillRect(0, 0, canvas.width, canvas.height);
	};

	canvas.onmousedown = function(e) {
   var rect = canvas.getBoundingClientRect();
		water.push(
		new Water(
    e.clientX - rect.left,
    e.clientY - rect.top,
		  10));
	};
 
	planet = new Planet(
	canvas.width / 2,
	canvas.height/2,
	100
 );

	var i = 10;
	while (i--)
	water.push(
	new Water(
	Math.random() * canvas.width,
	Math.random() * canvas.height,
	Math.random() * 10 + 4));

	setInterval(Loop, 1000 / 60);
};