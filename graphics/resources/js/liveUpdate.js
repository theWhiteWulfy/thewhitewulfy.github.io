// a constant used to indicate a function that does nothing
var NOOP = function() {}

// ------------------------------------------------------------------------
//   Find the font family, size and face for the provided node in the
//   HTML dom.  The result object contains fontSize, fontFamily and
//   fontFace entries.
//
function findFont( obj )
{
	var result = new Object();
	if ( obj.currentStyle ) {
		result.fontSize = obj.currentStyle[ 'fontSize' ];
		result.fontFamily = obj.currentStyle[ 'fontFamily' ];
		result.fontFace = obj.currentStyle[ 'fontFace' ];
	} else if ( document.defaultView && document.defaultView.getComputedStyle ) {
		var computedStyle = document.defaultView.getComputedStyle( obj, "" );
		result.fontSize = computedStyle.getPropertyValue( 'font-size' );
		result.fontFamily = computedStyle.getPropertyValue( 'font-family' );
		result.fontFace = computedStyle.getPropertyValue( 'font-face' );
	}
	return result;
}

// ---------------------------------------------------------------------------

/*
	Find the bounds of the specified node in the DOM.  This returns
	an objct with x,y, height and width fields
*/
function findBounds( obj )
{
	var bounds = new Object();
	bounds.x = 0;
	bounds.y = 0;
	bounds.width = obj.scrollWidth;
	bounds.height = obj.scrollHeight;
	if( obj.x != null ) {
		bounds.x = obj.x;
		bounds.y = obj.y;
	}
	else {
		while( obj.offsetLeft != null ) {
			bounds.x += obj.offsetLeft;
			bounds.y += obj.offsetTop;
			if( obj.offsetParent ) {
				obj = obj.offsetParent;
			}
			else {
				break;
			}
		}
	}
			
	// subtract the amount the page is scrolled from position
	if (self.pageYOffset) // all except Explorer
	{
		bounds.x -= self.pageXOffset;
		bounds.y -= self.pageYOffset;
	}
	else if (document.documentElement && document.documentElement.scrollTop)
		// Explorer 6 Strict
	{
		bounds.x -= document.documentElement.scrollLeft;
		bounds.y -= document.documentElement.scrollTop;
	}
	else if (document.body) // all other Explorers
	{
		bounds.x -= document.body.scrollLeft;
		bounds.y -= document.body.scrollTop;
	}

	return bounds;
}

// ---------------------------------------------------------------------------

var isFirefoxPat = /Firefox\/([0-9]+)[.]([0-9]+)[.]([0-9]+)/;
var firFoxArr = isFirefoxPat.exec( navigator.userAgent );
var isSafariPat = /AppleWebKit\/([0-9]+)[.]([0-9]+)/;
var safariArr = isSafariPat.exec( navigator.userAgent );

// ---------------------------------------------------------------------------

/*
	Default implementation does nothing when viewing the webpage normally
*/
var clickTarget = NOOP;
var tellLightroomWhatImagesWeAreUsing = NOOP;

// ---------------------------------------------------------------------------

var callCallback = NOOP;

// ---------------------------------------------------------------------------

if( window.myCallback != null ){
	// We're being previewed on Mac.  Create a callback
	// function for communicating from the web page into Lightroom.
	callCallback = function() {
		// On Mac we use a special javascript to talk to Lightroom.
		var javascript = 'myCallback.' + arguments[ 0 ] + "( ";
		var j = arguments.length;
		var c = j - 1;
		for( var i = 1; i < j; i++ ) {
			var arg = arguments[ i ];
			if( typeof( arg ) == 'string' ) {
				javascript = javascript + '"' + arg + '"';
			}
			if( typeof( arg ) == 'number' ) {
				javascript = javascript + arg
			}
			if( typeof( arg ) == 'undefined' ) {
				javascript = javascript + 'undefined'
			}
			if( i < c ) {
				javascript = javascript + ", "
			}
		}
		javascript = javascript + " )"
		eval( javascript )
	}
}

// ---------------------------------------------------------------------------

else if( window.AgMode == 'preview' ) {
	// We're being previewed on Windows.  Create a callback
	// function for communicating from the web page into Lightroom.
	callCallback = function() {
		// On windows we use a special lua: URL to talk to Lightroom.
		var lua = arguments[ 0 ] + "( ";
		var j = arguments.length;
		var c = j - 1;
		for( var i = 1; i < j; i++ ) {
			var arg = arguments[ i ];
			if( typeof( arg ) == 'string' ) {
				lua = lua + '"' + arg + '"';
			}
			if( typeof( arg ) == 'number' ) {
				lua = lua + arg
			}
			if( typeof( arg ) == 'undefined' ) {
				lua = lua + 'undefined'
			}
			if( i < c ) {
				lua = lua + ", "
			}
		}
		lua = lua + ")"
		// alert( lua )
		location.href = "lua:" + lua
	}
}

// ---------------------------------------------------------------------------

/*
	Set up live feedback between Lightroom and the previewed web page.
*/
if( callCallback != NOOP ) {
	tellLightroomWhatImagesWeAreUsing = function() {

		if( window.myCallback != null ) {
			var imgElements = document.getElementsByTagName( "img" );
			var elsLen = imgElements.length;
			var result = new Array()
			for( i = 0; i < elsLen; i++ ) {
				var element = imgElements[ i ];
				var imageID = element.id;
				// for html validation purposes, we've prepended "ID" to the GUID for this
				// image, so now we strip that off.
				imageID = imageID.substring( 2 );
				result[ i ] = imageID;
			}
			myCallback.setUsedFiles( result );
		}
	}

	clickTarget = function( obj, target, imageID ) {
		if( imageID != null ) {
			// for html validation purposes, we've prepended "ID" to the GUID for this
			// image, so now we strip that off.
			imageID = imageID.substring( 2 );
		}
		var bounds = findBounds( obj );
		var font = findFont( obj );
		callCallback( 'inPlaceEdit', target, bounds.x, bounds.y, bounds.width, bounds.height, font.fontFamily, font.fontSize, imageID )
	}
}

// ---------------------------------------------------------------------------

if( firFoxArr && ( firFoxArr[1] > 1 || firFoxArr[2] > 4 ) ||
      safariArr ) {
	window.gridOn = NOOP;
	window.gridOff= NOOP;
}
else {
	window.gridOn = function( t, id ) {
		t.agOriginalClassName = t.className;
		t.className =  "selectedThumbnail " + t.className;
	};
	window.gridOff= function( t ) {
		t.className = t.agOriginalClassName;
	};
}

var needThumbImgLink = !isFirefoxPat;


var oldOnLoad = window.onload;
window.onload = function() {
	if( window.AgOnLoad ) {
		window.AgOnLoad();
	}
	if( oldOnLoad ) {
		oldOnLoad();
	}
}

