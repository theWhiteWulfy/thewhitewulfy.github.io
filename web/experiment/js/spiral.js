$(function () {
	var myCanvas, context, width, height;
	var lines = [], numberOfLines = 12;
	var colours = ['#FFD800','#FF6A00','#FF0000','#0094FF','#0026FF','#4800FF','#7FFF8E','#B6FF00','#4CFF00', '#FFFFFF'];

	var Line = function() {
		return {
			x: 0,
			y: 0,
			size: 4,
			colour: '#FFFFFF',
			distance: 1,
			speed: 30,
			increment: 0.8,
			turn: 45,
			wobble: 7,
			rotation: random(0, 359),
			randomVariance: 0,
			opacity: 0.5,
			clockwise: true,
			glow: true,
			interval: {},
			tick: function() {
				var oldX = this.x;
				var oldY = this.y;

				if (this.clockwise)
					this.rotation -= this.turn;
				else
					this.rotation += this.turn;

				// Wobble (point at which lines bend sharply)
				if (this.wobble) {
					if (this.rotation < 0) this.rotation += this.wobble;
					if (this.rotation >= this.wobble) this.rotation -= this.wobble;
				}

				this.x = this.x + this.distance * Math.sin(this.rotation);
				this.y = this.y + this.distance * Math.cos(this.rotation);

				// Random wander
				if (this.randomVariance) {
					this.x += random((-1 * this.randomVariance), this.randomVariance);
					this.y += random((-1 * this.randomVariance), this.randomVariance);
				}

				if (this.glow) {
					drawLine(oldX, oldY, this.x, this.y, this.size * 6, this.colour, 0.03);
					drawLine(oldX, oldY, this.x, this.y, this.size * 4, this.colour, 0.05);
				}

				drawLine(oldX, oldY, this.x, this.y, this.size, this.colour, this.opacity);

				this.distance += this.increment;

				return this;
			},
			init: function(details) {
				for (var x in details) {
					this[x] = details[x];
				}

				var self = this;
				this.interval = setInterval(function() { self.tick(); }, this.speed);

				return this;
			},
			stop: function() {
				clearInterval(this.interval);
			}
		};
	};

	if ($("canvas").length > 0) {
		myCanvas = $("#canvas")[0];
		context = myCanvas.getContext("2d");
		resizeCanvas();
		eventListeners();
		startAnimation();
	}

	function resizeCanvas() {
		myCanvas.width = $("canvas").width();
	    myCanvas.height = $("canvas").height();
	    width = myCanvas.width;
		height = myCanvas.height;
	}

	$(window).on('resize', resizeCanvas);

	function eventListeners() {
		$('#submit').on('click', function() {
			var options = {};

			$('#controls input[type="text"]').each(function() {
				options[$(this).attr('id')] = checkNumber($(this).val());
			});

			numberOfLines = options.numberOfLines;

			var shareString = '';

			for (var x in options) {
				shareString += options[x] + '|';
			}

			$('#sharecode').val(shareString);

			startAnimation(options);
			return false;
		});

		$('#random').on('click', function() {
			randomSettings();
		});

		$('#hide').on('click', function() {
			$('#controls').hide();
		});

		$('#download').on('click', function() {
      		var image = myCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
			var filename = 'spiral_' + (new Date()).getTime() + '.png';

			$(this).attr('href', image).attr('download', filename);
		});

		$('#sharecode')
		.on('paste', function() {
			setTimeout(function() {
				var shareString = $('#sharecode').val().split('|');

				$('#controls input[type="text"]').not('#sharecode').each(function(x) {
					$(this).val(shareString[x]);
				});

				$('#submit').trigger('click');
			}, 100);
		})
		.on('focus', function() {
			$(this).select();
		});
	}

	function randomSettings() {
		var settings = {
			numberOfLines:    random(2, 12),
			size:             random(1, 10),
			distance:         random(1, 30),
			speed:            random(2, 6) * 10,
			increment:        random(1, 10) / 10,
			turn:             random(1, 200),
			wobble:           random(1, 400),
			opacity:          random(3, 10) / 10,
			randomVariance:   0
		};

		for (var x in settings) {
			$('#' + x).val(settings[x]);
		}

		$('#submit').trigger('click');
	}

	function startAnimation(options) {
    	options = options ? options : {};

		options.x = width / 2;
		options.y = height / 2;

		context.clearRect(0, 0, width, height);
		context.fillStyle = '#000000';
		context.globalAlpha = 1;
		context.fillRect(0, 0, width, height);

		for (var x = 0; x < lines.length; x++) {
			lines[x].stop();
		}

		lines = [];

		for (var y = 0; y < numberOfLines; y++) {
			options.colour = colours[random(0, colours.length - 1)];
			options.rotation = (360 / numberOfLines) * y;
			lines.push(
				Line().init(options)
			);
		}
	}

	function drawPoint(x, y, size, colour) {
		context.fillStyle = colour;
		context.fillRect(x, y, size, size);
	}

	function drawLine(x1, y1, x2, y2, size, colour, opacity) {
		setOpacity(opacity);
		context.beginPath();
		context.strokeStyle = colour;
		context.lineWidth = size;
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();
		context.closePath();
	}

	function setOpacity(alpha) {
		context.globalAlpha = alpha;
	}

	function random(min, max) {
		return (Math.floor(Math.random() * ((max - min) + 1) + min));
	}

	function checkNumber(n) {
		n = parseFloat(n);
		if (isNaN(n) || n < 0) n = 0;

		return n;
	}
});



  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-45462422-7', 'auto');
  ga('send', 'pageview');