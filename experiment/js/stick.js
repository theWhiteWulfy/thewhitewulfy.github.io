if(window.CP && window.CP.PenTimer) window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;

var SVG = Snap('#svg');
var container = $('.container');
var sizes = {};
sizes.container = {width: 0, height: 0};

var colors = {
	stick: {
		dark : '#4C3E26',
		base : '#755F3B',
		light: '#836A41',
		inside: '#937B55'
	},
	leaf: {
		light: '#46611F',
		base: '#3A5019',
		dark: '#324516'
	}
}

var stickStep = 30;
var drawRight = 0;
var stickThickness = 20;

onResize();

var randomness = [];
var specials = [];
var drawing = [];
var drawPath = SVG.path().attr({
  	fill: "none",
  	stroke: "#ff0000",
  	strokeWidth: 0,
	strokeDasharray: '5 5'
});

var stick = SVG.group();
var stickBack;
var stickFront;
var stickEnd;
var stickBase = stick.path().attr({
  	fill: colors.stick.base,
  	stroke: "#000000",
  	strokeWidth: 0
});

var autoStickSpeed = 30;
var autoStick = [];
var autoStickMarginWidth = sizes.container.width > 1000 ? 300 : 100;
var autoStickMarginHeight = 100;
var count = Math.round((sizes.container.width - (autoStickMarginWidth * 2)) / stickStep)

for(var i = 0; i <count; i++)
{
	if(i == 0) autoStick.push([autoStickMarginWidth , sizes.container.height/2])
	else
	{
		var newY = autoStick[i-1][1] + (Math.random() * 40) - 20;
		if(newY < autoStickMarginHeight) newY = autoStickMarginHeight;
		else if(newY > sizes.container.height - autoStickMarginHeight) newY = sizes.container.height - autoStickMarginHeight
		autoStick.push([autoStickMarginWidth + (i*stickStep),  newY] )
	}
}

drawAutoStick(true)

function drawAutoStick(first)
{
	if(autoStick.length > 0)
	{
		var newPoint = autoStick.splice(0, 1);
		if(first)
		{
			startDrawing({offsetX: newPoint[0][0], offsetY: newPoint[0][1], auto: true})
		}
		else
		{
			draw({offsetX: newPoint[0][0], offsetY: newPoint[0][1]});
		}
		setTimeout(drawAutoStick, autoStickSpeed)
	}
	else
	{
		container.on('mousedown', startDrawing);
	}
}



function startDrawing(e)
{
	drawing = [[e.offsetX, e.offsetY]];
	randomness = [[0, 0, 0, 0]];
	specials = [null];
	if(!e.auto)
	{
		container.on('mousemove', draw);
		container.on('mouseup', stopDrawing);
	}
}

function draw(e)
{
	if(drawing.length == 1 && e.offsetX != drawing[0][0])
	{
		drawRight = e.offsetX > drawing[0][0] ? true : false;
	}
	
	var oldX = drawing[drawing.length - 1][0];
	var newX = e.offsetX;
	
	if((drawRight && newX - oldX > stickStep) || (!drawRight && oldX - newX > stickStep)) 
	{
		
		
		
		
		drawing.push([e.offsetX, e.offsetY]);
		randomness.push([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5])
		
		var random = Math.random();
		
		if(random > 0.95)
		{
			specials.push({type: 'twig_back', data: createTwigPaths(e.offsetX, e.offsetY)});
		}
		else if(random > 0.9)
		{
			specials.push({type: 'twig_front', data: createTwigPaths(e.offsetX, e.offsetY)});
		}
		else if(random > 0.85)
		{
			specials.push({type: 'leaf_front', data: createLeafPaths(e.offsetX, e.offsetY)} );
		}
		else if(random > 0.8)
		{
			specials.push({type: 'leaf_back', data: createLeafPaths(e.offsetX, e.offsetY)} );
		}
		else
		{
			specials.push(null);
		}
		
		drawStick();
		drawLine();
		
		if(stickBack) stickBack.remove();
		stickBack = stick.group();
		
		drawSpecials(['twig_back', 'leaf_back'], stickBack);
		
		for(var i = 0; i <= 10; i++ )
		{
			drawGrain(stickBack, drawPath, stickThickness - ((stickThickness / 100) * 20));
		}
		
		if(stickEnd) stickEnd.remove();
		stickEnd = stick.group();
		
		drawStickEnd();
		
		if(stickFront) stickFront.remove();
		stickFront = stick.group();
		
		
		
		for(var i = 0; i <= 10; i++ )
		{
			drawGrain(stickFront, drawPath, stickThickness - ((stickThickness / 100) * 20));
		}
		
		drawSpecials(['twig_front', 'leaf_front'], stickFront);
	}
}

function stopDrawing(e)
{
	container.off('mousemove');
	//container.off('mousedown');
	container.off('mouseup');
}

function drawLine()
{
	var lineStr = '';
	for(var i = 0; i < drawing.length; i++)
	{
		lineStr += drawing[i].join(',') + ' ';
	}
	drawPath.attr('d',"M" + lineStr)
}

function drawStick()
{
	var stickStr = '';
	var i;
	for(i = 0; i < drawing.length; i++)
	{
		stickStr += getStickPathPoint(drawing[i][0], drawing[i][1], -stickThickness, randomness[i][0], randomness[i][1]).join(',') + ' ';
	}
	
	for(i = drawing.length - 1; i >= 0; i--)
	{
		stickStr += getStickPathPoint(drawing[i][0], drawing[i][1], stickThickness, randomness[i][2], randomness[i][3]).join(',') + ' ';
	}
	
	stickBase.attr('d',"M" + stickStr + ' Z')
}

function getStickEnd(i, yOffset)
{
	var newString = ''
	var curve = i > 0 ? stickThickness : -stickThickness;
	newString += 'Q' + getStickPathPoint(drawing[i][0] + curve, drawing[i][1], 0, 0, 0) + ' ';
	newString += '' + getStickPathPoint(drawing[i][0], drawing[i][1], yOffset, randomness[i][0], randomness[i][1]).join(',') + ' ';
	return newString;
}

function getStickPathPoint(x, y, yOffset, xRandom, yRandom)
{
	var x = x + (xRandom * 20);
	var y = y + yOffset + (yRandom * 10);
	
	return [x, y];
}

function getLineColor(offset, range)
{
	var range = ((range * 2) / 3) / 2;
	
	if(offset > range || Math.random() < 0.02) return colors.stick.dark;
	if(offset < -range || Math.random() < 0.1) return colors.stick.light;
	return colors.stick.base;
}

function drawGrain(holder, path, offset)
{
	
	var lengthChunks = 20;
	var length = path.getTotalLength();
	var count = length / lengthChunks;
	
	var toReturn = [];
	
	// get points along the path
	
	var points = [];
	for(var i = 0; i < count; i++)
	{
		
		var p = path.getPointAtLength( lengthChunks * i );
		points.push([p.x, p.y]);
	}
	
	// group points into chunks
	
	var chunks = [[]];
	var translateY = (Math.random() * (offset * 2)) - offset;
	var grainColors = [getLineColor(translateY, offset)];
	
	while(points.length)
	{
		
		if(chunks[0].length > 2 && points.length > 2 && Math.random() < 0.2)
		{
			translateY = (Math.random() * (offset * 2)) - offset;
			chunks.unshift([]);
			grainColors.unshift(getLineColor(translateY, offset));
		}
		var toAdd = points.shift();
		toAdd[1] += translateY;
		if(drawRight) toAdd[0] -= offset - Math.abs(translateY)
		else toAdd[0] += offset - Math.abs(translateY)
		chunks[0].push(toAdd);
	}
	
	// make path strings from chunks
	
	for(var i = 0; i < chunks.length; i++)
	{
		var pathString = 'M'
		for(var j = 0; j < chunks[i].length; j++)
		{
			pathString += chunks[i][j].join(',') + ' ';
		}
		
		var grain = holder.path(pathString)
			.attr({
				fill: 'none',
				stroke: grainColors[i],
				strokeWidth: 4 + (Math.random() * 8),
				'stroke-linecap': "round"
			})
		//toReturn.push(pathString);
	}
	
	return toReturn;
}

function drawStickEnd()
{
	var point = drawing[drawing.length - 1];
	stickEnd.ellipse(point[0] + (drawRight ? -3 : 3), point[1], stickThickness / 1.5, stickThickness)
		.attr({
			fill: colors.stick.inside
		})
	
	
		stickEnd.ellipse(point[0] + (drawRight ? -3 : 3), point[1], 2, 3)
			.attr({
				fill: colors.stick.light,
			opacity: Math.random()
			})
	
	var endCurve = 'M';
	endCurve += point[0] + ',' + (point[1] - (stickThickness / 2));
	endCurve += ' Q' + (point[0] + (stickThickness / (2 + Math.random())) + (drawRight ? -3 : 3)) + ',' + (point[1] - (stickThickness / 2));
	endCurve += ' ' + (point[0] + (stickThickness / (2 + Math.random())) + (drawRight ? -3 : 3)) + ',' + point[1];
	endCurve += ' Q' + (point[0] + (stickThickness / (2 + Math.random())) + (drawRight ? -3 : 3)) + ',' + (point[1] + (stickThickness / 2));
	endCurve += ' ' + (point[0] + (drawRight ? -3 : 3)) + ',' + (point[1] + (stickThickness / 2));
	endCurve += ' Q' + (point[0] - (stickThickness / (2 + Math.random())) + (drawRight ? -3 : 3)) + ',' + (point[1] + (stickThickness / 2));
	endCurve += ' ' + (point[0] - (stickThickness / (2 + Math.random())) + (drawRight ? -3 : 3)) + ',' + point[1];
	
	stickEnd.path(endCurve)
			.attr({
				fill: 'none',
				stroke: colors.stick.light,
				strokeWidth: 1 + (Math.random() * 2)
			})
}

function createTwigPaths(x, y)
{
	var paths = [];
	
	var xDirection = (Math.random()  - 0.5) * 20;
	var yDirection = (Math.random()  - 0.5) * 20;
	
	for(var i = 0; i <= 2 + Math.round(Math.random() * 3); i++)
	{
		paths.push([
			x + (i * xDirection + (Math.random() * 10)),
			y + (i * yDirection + (Math.random() * 10))
		]);	
	}
	
	return paths;
}

function createLeafPaths(x, y)
{
	var centerPath = [];
	
	var xDirection = (Math.random()  - 0.5) * 30;
	var yDirection = (Math.random()  - 0.5) * 100;
	
	for(var i = 0; i < 3; i++)
	{
		centerPath.push([
			x + (i * xDirection + (Math.random() * 50)),
			y + (i * yDirection + (Math.random() * 10))
		]);	
	}
	
	return centerPath;
}

function drawSpecials(which, where)
{
	var specialsHolder = where.group();
	
	for(var i = 0; i < specials.length - 1; i++)
	{
		if(specials[i] && which.indexOf(specials[i].type) > -1)
		{
			var data = specials[i].data;
			var type = specials[i].type;
			
			if(data.length > 1)
			{	
				switch(type)
				{
					case 'twig_back':
					case 'twig_front':

						
							console.log(type, data)
							var twigPath = 'M';

							for(var j = 0; j < data.length; j++)
							{
								var newX = data[j][0] + ((Math.random() * 4) - 2);
								var newY = data[j][1] + ((Math.random() * 4) - 2);
								twigPath += newX + ',' + newY + ' ';
							}
							specialsHolder.path(twigPath)
								.attr({
									fill: 'none',
									stroke: colors.stick.dark,
									strokeWidth: 6 + Math.random() * 4,
									'stroke-linecap': Math.random() > 0.5 ? "round" : 'square',
								})
								.transform( 't1,5');
							specialsHolder.path(twigPath)
								.attr({
									fill: 'none',
									stroke: Math.random() > 0.5 ? colors.stick.base : colors.stick.light,
									strokeWidth: 6 + Math.random() * 4,
									'stroke-linecap': "round"

								})
						
						break;
					case 'knot':
						specialsHolder.ellipse(data[0], data[1], 10, 8)
							.attr({
								fill: colors.stick.inside
							})
						specialsHolder.path('M' + (data[0] - 12) + ',' + data[1] + ' Q' + data[0] + ',' + (data[1] - 8) + ' ' + (data[0] + 12) + ',' + data[1] )
							.attr({
								fill: 'none',
								stroke: colors.stick.dark,
								strokeWidth: 4
							})
						break;
					case 'leaf_front':
					case 'leaf_back':
	
						var leafWidth = 20 + (Math.random() * 30);
						var leafPath = 'M';

						for(var j = 0; j < data.length; j++)
						{
							var newX = data[j][0] + ((Math.random() * 4) - 2);
							var newY = data[j][1] + ((Math.random() * 4) - 2);
							leafPath += (j%2 != 0 ? 'Q' : '') +  (j%2 != 0 ? newX + leafWidth : newX) + ',' + newY + ' ';
						}
						specialsHolder.path(leafPath + ' Z')
							.attr({
								fill: colors.leaf.base,
							})
						
						var leafPath = 'M';

						for(var j = 0; j < data.length; j++)
						{
							var newX = data[j][0] + ((Math.random() * 4) - 2);
							var newY = data[j][1] + ((Math.random() * 4) - 2);
							leafPath += (j%2 != 0 ? 'Q' : '') +  (j%2 != 0 ? newX - leafWidth : newX) + ',' + newY + ' ';
						}
						specialsHolder.path(leafPath + ' Z')
							.attr({
								fill: colors.leaf.light,
							})
						
						var leafPath = 'M';

						for(var j = 0; j < data.length; j++)
						{
							var newX = data[j][0] + ((Math.random() * 4) - 2);
							var newY = data[j][1] + ((Math.random() * 4) - 2);
							leafPath += (j%2 != 0 ? 'Q' : '') +  newX + ',' + newY + ' ';
						}
						specialsHolder.path(leafPath)
							.attr({
								fill: 'none',
								stroke: colors.leaf.dark,
								strokeWidth: 4
							})
						break;
				}
			}
		}
	}
}

// ON RESIZE

$(window).resize(onResize);

function onResize()
{
	sizes.container.width = container.width();
	sizes.container.height = container.height();
	
	SVG.attr({
		width: sizes.container.width,
		height: sizes.container.height
	})	
}
