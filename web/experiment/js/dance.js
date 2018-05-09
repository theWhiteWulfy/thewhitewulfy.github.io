class Robot {

	constructor(color, light, size, x, y, struct) {

		this.points = [];
		this.links = [];
		this.frame = 0;
		this.dir = 1;
		this.size = size;
		this.color = Math.round(color);
		this.light = light;

		// ---- points ----
		let id = 0;
		for (let p of struct.points) {
			this.points.push(
				new Point(id++, size * p[0] + x, size * p[1] + y, p[2])
			);
		}

		// ---- links ----
		for (let l of struct.links) {

			let p0 = this.points[l[0]];
			let p1 = this.points[l[1]];
			let dx = p0.x - p1.x;
			let dy = p0.y - p1.y;
			this.links.push(
				new Link(
					this, p0, p1,
					Math.sqrt(dx * dx + dy * dy),
					l[2] * size / 3,
					l[3], l[4]
				)
			);

		}

	}

	update() {

		// ---- beat ----
		if (++this.frame % 20 === 0) this.dir = -this.dir;

		// ---- create giants ----
		if (dancerDrag && this === dancerDrag && this.size < 16 && this.frame > 600) {
			dancerDrag = null;
			dancers.push(
				new Robot(
					this.color,
					this.light * 1.25,
					this.size * 2,
					pointer.x,
					pointer.y - 100 * this.size * 2,
					struct
				)
			);
			dancers.sort(function(d0, d1) {
				return d0.size - d1.size;
			});
		}

		// ---- update links ----
		for (let link of this.links) {

			let p0 = link.p0;
			let p1 = link.p1;
			let dx = p0.x - p1.x;
			let dy = p0.y - p1.y;
			let dist = Math.sqrt(dx * dx + dy * dy);

			if (dist) {

				let tw = p0.w + p1.w;
				let r1 = p1.w / tw;
				let r0 = p0.w / tw;
				let dz = (link.distance - dist) * link.force;
				dx = dx / dist * dz;
				dy = dy / dist * dz;
				p1.x -= dx * r0;
				p1.y -= dy * r0;
				p0.x += dx * r1;
				p0.y += dy * r1;

			}

		}

		// ---- update points ----
		for (let point of this.points) {

			// ---- drag ----
			if (this === dancerDrag && point === pointDrag) {

				point.x += (pointer.x - point.x) * 0.1;
				point.y += (pointer.y - point.y) * 0.1;

			}

			// ---- dance ----
			if (this !== dancerDrag) {

				point.fn && point.fn(16 * Math.sqrt(this.size), this.dir);

			}

			// ---- verlet integration ----
			point.vx = point.x - point.px;
			point.vy = point.y - point.py;
			point.px = point.x;
			point.py = point.y;
			point.vx *= 0.995;
			point.vy *= 0.995;
			point.x += point.vx;
			point.y += point.vy + 0.01;

		}

		for (let link of this.links) {

			let p1 = link.p1;

			// ---- ground ----
			if (p1.y > canvas.height * ground - link.size * 0.5) {
				p1.y = canvas.height * ground - link.size * 0.5;
				p1.x -= p1.vx;
				p1.vx = 0;
				p1.vy = 0;
			}

			// ---- borders ----
			if (p1.id === 1 || p1.id === 2) {
				if (p1.x > canvas.width - link.size) p1.x = canvas.width - link.size;
				else if (p1.x < link.size) p1.x = link.size;
			}

		}

	}

	draw() {

		for (let link of this.links) {
			if (link.size) {

				let dx = link.p1.x - link.p0.x;
				let dy = link.p1.y - link.p0.y;
				let a = Math.atan2(dy, dx);
				let d = Math.sqrt(dx * dx + dy * dy);

				// ---- shadow ----
				ctx.save();
				ctx.translate(link.p0.x + link.size * 0.25, link.p0.y + link.size * 0.25);
				ctx.rotate(a);
				ctx.drawImage(link.shadow, -link.size * 0.5, -link.size * 0.5, d + link.size, link.size);
				ctx.restore();

				// ---- stroke ----
				ctx.save();
				ctx.translate(link.p0.x, link.p0.y);
				ctx.rotate(a);
				ctx.drawImage(link.image, -link.size * 0.5, -link.size * 0.5, d + link.size, link.size);
				ctx.restore();

			}
		}

	}

}

class Link {

	constructor(parent, p0, p1, dist, size, light, force) {

		// ---- cache strokes ----
		function stroke(color, axis) {

			let image = document.createElement('canvas');
			image.width = dist + size;
			image.height = size;
			let ict = image.getContext('2d');
			ict.beginPath();
			ict.lineCap = "round";
			ict.lineWidth = size;
			ict.strokeStyle = color;
			ict.moveTo(size * 0.5, size * 0.5);
			ict.lineTo(size * 0.5 + dist, size * 0.5);
			ict.stroke();
			if (axis) {
				let s = size / 10;
				ict.fillStyle = "#000";
				ict.fillRect(size * 0.5 - s, size * 0.5 - s, s * 2, s * 2);
				ict.fillRect(size * 0.5 - s + dist, size * 0.5 - s, s * 2, s * 2);
			}
			return image;

		}

		this.p0 = p0;
		this.p1 = p1;
		this.distance = dist;
		this.size = size;
		this.light = light || 1.0;
		this.force = force || 0.5;
		this.image = stroke("hsl(" + parent.color + " ,30%, " + (parent.light * this.light) + "%)", true);
		this.shadow = stroke("rgba(0,0,0,0.5)");

	}

}

class Point {

	constructor(id, x, y, fn, w) {

		this.id = id;
		this.x = x;
		this.y = y;
		this.w = w || 0.5;
		this.fn = fn || null;
		this.px = x;
		this.py = y;
		this.vx = 0;
		this.vy = 0;

	}

}

class Canvas {

	constructor() {

		this.elem = document.createElement('canvas');
		this.ctx = this.elem.getContext('2d');
		document.body.appendChild(this.elem);
		this.resize();
		window.addEventListener('resize', () => this.resize(), false);

	}

	resize() {

		this.width = this.elem.width = this.elem.offsetWidth;
		this.height = this.elem.height = this.elem.offsetHeight;
		ground = this.height > 500 ? 0.85 : 1.0;

	}

}

class Pointer {

	constructor(canvas) {

		this.x = 0;
		this.y = 0;
		this.canvas = canvas;

		window.addEventListener('mousemove', e => this.move(e), false);
		canvas.elem.addEventListener('touchmove', e => this.move(e), false);
		window.addEventListener('mousedown', e => this.down(e), false);
		window.addEventListener('touchstart', e => this.down(e), false);
		window.addEventListener('mouseup', e => this.up(e), false);
		window.addEventListener('touchend', e => this.up(e), false);

	}

	down(e) {

		this.move(e);

		for (let dancer of dancers) {
			for (let point of dancer.points) {
				let dx = pointer.x - point.x;
				let dy = pointer.y - point.y;
				let d = Math.sqrt(dx * dx + dy * dy);
				if (d < 60) {
					dancerDrag = dancer;
					pointDrag = point;
					dancer.frame = 0;
				}
			}
		}

	}

	up(e) {
		dancerDrag = null;
	}

	move(e) {

		let touchMode = e.targetTouches,
			pointer;
		if (touchMode) {
			e.preventDefault();
			pointer = touchMode[0];
		} else pointer = e;
		this.x = pointer.clientX;
		this.y = pointer.clientY;

	}

}

// ---- init ----
let ground = 1.0;
let canvas = new Canvas();
let ctx = canvas.ctx;
let pointer = new Pointer(canvas);
let dancerDrag = null;
let pointDrag = null;

// ---- main loop ----

function run() {

	requestAnimationFrame(run);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#222";
	ctx.fillRect(0, 0, canvas.width, canvas.height * 0.15);
	ctx.fillRect(0, canvas.height * 0.85, canvas.width, canvas.height * 0.15);

	for (let dancer of dancers) {

		dancer.update();
		dancer.draw();

	}

}

// ---- robot structure ----

let struct = {

	points: [
		[0, -4, function(s, d) {
			this.y -= 0.01 * s;
		}],
		[0, -16, function(s, d) {
			this.y -= 0.02 * s * d;
		}],
		[0, 12, function(s, d) {
			this.y += 0.02 * s * d;
		}],
		[-12, 0],
		[12, 0],
		[-3, 34, function(s, d) {
			if (d > 0) {
				this.x += 0.01 * s;
				this.y -= 0.015 * s;
			} else {
				this.y += 0.02 * s;
			}
		}],
		[3, 34, function(s, d) {
			if (d > 0) {
				this.y += 0.02 * s;
			} else {
				this.x -= 0.01 * s;
				this.y -= 0.015 * s;
			}
		}],
		[-28, 0, function(s, d) {
			this.x += this.vx * 0.035;
			this.y -= 0.001 * s;
		}],
		[28, 0, function(s, d) {
			this.x += this.vx * 0.035;
			this.y -= 0.001 * s;
		}],
		[-3, 64, function(s, d) {
			this.y += 0.02 * s;
			if (d > 0) {
				this.y -= 0.01 * s;
			} else {
				this.y += 0.05 * s;
			}
		}],
		[3, 64, function(s, d) {
			this.y += 0.02 * s;
			if (d > 0) {
				this.y += 0.05 * s;
			} else {
				this.y -= 0.01 * s;
			}
		}],
		[0, -4.1]
	],

	links: [
		[3, 7, 12, 0.5],
		[1, 3, 24, 0.5],
		[1, 0, 18, 0.5],
		[0, 11, 60, 0.8],
		[5, 9, 16, 0.5],
		[2, 5, 32, 0.5],
		[1, 2, 50, 1],
		[6, 10, 16, 1.5],
		[2, 6, 32, 1.5],
		[4, 8, 12, 1.5],
		[1, 4, 24, 1.5]
	]
};

// ---- instanciate robots ----
let dancers = [];

for (let i = 0; i < 6; i++) {
	dancers.push(
		new Robot(
			i * 360 / 7,
			80,
			4,
			(i + 2) * canvas.width / 9,
			canvas.height * ground - 295,
			struct
		)
	);
}

run();