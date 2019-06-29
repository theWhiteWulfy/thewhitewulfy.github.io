

(function($) {

	skel.breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 1024px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	$(function() {

		var $body = $('body'),
			$header = $('#header'),
			$nav = $('#nav'), $nav_a = $nav.find('a'),
			$wrapper = $('#wrapper');

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Header.
			var ids = [];

			// Set up nav items.
				$nav_a
					.scrolly({ offset: 44 })
					.on('click', function(event) {

						var $this = $(this),
							href = $this.attr('href');

						// Not an internal link? Bail.
							if (href.charAt(0) != '#')
								return;

						// Prevent default behavior.
							event.preventDefault();

						// Remove active class from all links and mark them as locked (so scrollzer leaves them alone).
							$nav_a
								.removeClass('active')
								.addClass('scrollzer-locked');

						// Set active class on this link.
							$this.addClass('active');

					})
					.each(function() {

						var $this = $(this),
							href = $this.attr('href'),
							id;

						// Not an internal link? Bail.
							if (href.charAt(0) != '#')
								return;

						// Add to scrollzer ID list.
							id = href.substring(1);
							$this.attr('id', id + '-link');
							ids.push(id);

					});

			// Initialize scrollzer.
				$.scrollzer(ids, { pad: 300, lastHack: true });

		// Off-Canvas Navigation.

			// Title Bar.
				$(
					'<div id="titleBar">' +
						'<a href="#header" class="toggle"></a>' +
						'<span class="title">' + $('#logo').html() + '</span>' +
					'</div>'
				)
					.appendTo($body);

			// Header.
				$('#header')
					.panel({
						delay: 500,
						hideOnClick: true,
						hideOnSwipe: true,
						resetScroll: true,
						resetForms: true,
						side: 'right',
						target: $body,
						visibleClass: 'header-visible'
					});

			// Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
				if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
					$('#titleBar, #header, #wrapper')
						.css('transition', 'none');

	});


})(jQuery);

//color picker
var colorPicker = (function() {
	var config = {
		baseColors: [
			[46, 204, 113],
			[52, 152, 219],
			[155, 89, 182],
			[231, 76, 60],
			[247, 71, 112]
		],
		lightModifier: 20,
		darkModifier: 0,
		transitionDuration: 200,
		transitionDelay: 25,
		variationTotal: 6
	};

	var state = {
		activeColor: [0, 0, 0]
	};

	function init() {
		createColorPicker(function() {
			appendBaseColors();
		});

		addEventListeners();

		setFirstColorActive(function() {
			setFirstModifiedColorActive();
		});
	}

	function setActiveBaseColor(el) {
		$(".color.active").removeClass("active");
		el.addClass("active");
	}

	function setActiveColor(el) {
		$(".color-var.active").removeClass("active");
		el.addClass("active");
		state.activeColor = el.data("color").split(",");
	}

	function addEventListeners() {
		$("body").on("click", ".color", function() {
			var color = $(this).data("color").split(",");
			setActiveBaseColor($(this));

			hideVariations(function() {
				createVariations(color, function() {
					setDelays(function() {
						showVariations();
					});
				});
			});
		});

		$("body").on("click", ".color-var", function() {
			setActiveColor($(this));
			setBackgroundColor();
		});
	}

	function setFirstColorActive(callback) {
		$(".color").eq(1).trigger("click");
		callback();
	}

	function setFirstModifiedColorActive() {
		setTimeout(function() {
			$(".color-var").eq(7).trigger("click");
		}, 500);
	}

	function createColorPicker(callback) {
		$(".color-picker").append('<div class="base-colors"></div>');
		$(".color-picker").append('<div class="varied-colors"></div>');
		$(".color-picker").append('<div class="active-color"></div>');
		$(".color-picker").append('<div class="color-history"></div>');

		callback();
	}

	function appendBaseColors() {
		for (i = 0; i < config.baseColors.length; i++) {
			$(".base-colors").append(
				'<div class="color" data-color="' +
					config.baseColors[i].join() +
					'" style="background-color: rgb(' +
					config.baseColors[i].join() +
					');"></div>'
			);
		}
	}

	function setBackgroundColor() {
		$("#header").css({
			"background-color": "rgb(" + state.activeColor + ")"
		});
		$("#titleBar").css({
			"background": "rgb(" + state.activeColor + ")"
		});

		$("ul.feature-icons li:before").css({
			"background-color": "rgb(" + state.activeColor + ")"
		});		
		$("#header > nav ul li a.active").css({
			"color": "rgb(" + state.activeColor + ")"
		});
		$("a.icon:hover").css({
		    "border-bottom-color": "rgb(" + state.activeColor + ")",
		    "color": "rgb(" + state.activeColor + ")",
		    "border-color": "rgb(" + state.activeColor + ")"
		});
		$(".devicon-list li i:hover").css({
			"color": "rgb(" + state.activeColor + ")"
		});
        $(".mfb-component__button--child").css({
			"background-color": "rgb(" + state.activeColor + ")"
		});
        $(".mfb-component__button--main").css({
			"background-color": "rgb(" + state.activeColor + ")"
		});
	}

	function createVariations(color, callback) {
		$(".varied-colors").html("");

		for (var i = 0; i < config.variationTotal; i++) {
			var newColor = [];

			for (var x = 0; x < color.length; x++) {
				var modifiedColor = Number(color[x]) - 100 + config.lightModifier * i;

				if (modifiedColor <= 0) {
					modifiedColor = 0;
				} else if (modifiedColor >= 255) {
					modifiedColor = 255;
				}

				newColor.push(modifiedColor);
			}

			$(".varied-colors").append(
				'<div data-color="' +
					newColor +
					'" class="color-var" style="background-color: rgb(' +
					newColor +
					');"></div>'
			);
		}

		callback();
	}

	function setDelays(callback) {
		$(".color-var").each(function(x) {
			$(this).css({
				transition:
					"transform " +
						config.transitionDuration / 1000 +
						"s " +
						config.transitionDelay / 1000 * x +
						"s"
			});
		});

		callback();
	}

	function showVariations() {
		setTimeout(function() {
			$(".color-var").addClass("visible");
		}, config.transitionDelay * config.variationTotal);
	}

	function hideVariations(callback) {
		$(".color-var").removeClass("visible").removeClass("active");

		setTimeout(function() {
			callback();
		}, config.transitionDelay * config.variationTotal);
	}

	return {
		init: init
	};
})();

colorPicker.init();
