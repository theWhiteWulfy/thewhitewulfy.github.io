$(document).ready(function(){

	$("#stormtrooper").click(function(){
		$("body").removeClass();
		$("body").addClass("stormtrooper");
	})
	$("#c3po").click(function(){
		$("body").removeClass();
		$("body").addClass("c3po");
	})
	$("#darthvader").click(function(){
		$("body").removeClass();
		$("body").addClass("darthvader");
	})
	$("#bobafett").click(function(){
		$("body").removeClass();
		$("body").addClass("bobafett");
	})
	$("#imperialguard").click(function(){
		$("body").removeClass();
		$("body").addClass("imperialguard");
	})

	setInterval(function(){
	    $("body").toggleClass("glimmer");
	}, 3000);	

}); 