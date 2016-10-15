$('.window').draggable();
$('.icon').draggable();

$('.cancel, .close').on('click', function(e){
   e.preventDefault();
  $('.window').hide();
});

$('.ok').on('click', function(e){
   e.preventDefault();
  $('.overlay').toggleClass('on');
  $('.power-button').fadeIn();
});

$('.start-btn').on('click', function(e){
   e.preventDefault();
  $(this).toggleClass('active');
  $('.start-menu').toggleClass('open');
});


$('.windows-update').on('click', function(){
  $('.overlay').addClass('on');
  $('.start-menu').removeClass('open');
  $('.start-btn').removeClass('active');
  $('.window').hide();
  $('.power-button').hide();
  setTimeout(function(){
    $('.desktop').addClass('windowsXP');
    $('.overlay').removeClass('on');
    }, 3000);
});


$('.turn-on-computer').on('click', function(){
  $('.power-button').addClass('on');
  $('.window').hide();
  $('.start-menu').removeClass('open');
  $('.start-btn').removeClass('active');
  setTimeout(function(){
    $('.power-button').removeClass('on');
    $('.power-button').fadeOut();
    }, 2000);
  setTimeout(function(){
    $('.overlay').removeClass('on');
    }, 3000);
});



