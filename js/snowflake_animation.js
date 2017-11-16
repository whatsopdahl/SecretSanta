$( document ).ready( function() {
	//get all addressess of snowflakes we want to use
	var addresses = [];
	var root = "snowflakes/";
	//iterate over items in images/rsz_png file
	addresses.push(root + "rsz_circle31.png");
	addresses.push(root + "rsz_cross40.png");
	addresses.push(root + "rsz_crystal.png");
	addresses.push(root + "rsz_crystal1.png");
	addresses.push(root + "rsz_crystal2.png");
	addresses.push(root + "rsz_diamond19.png");
	addresses.push(root + "rsz_eight3.png");
	addresses.push(root + "rsz_eight4.png");
	addresses.push(root + "rsz_flake.png");

	//create list of snowflakes
	var $snowflakes = $([]);

	var width = ($('body').width() > 0) ? $('body').width() : screen.width;

	//get number of snowflakes per row
	var sfPerRow = Math.floor(width/20);
	var left = 20;

	//create right number of snowflake images
	var i;
	for (i=0; i < sfPerRow; i++) {
		var snowflake = createImageElement(addresses);
		var $snowflake = $(snowflake);
		$snowflake.css('left', ((left * i).toString() + 'px'));
		$snowflake.attr('id','sf-'+ i.toString());
		var r = getRandomInt(0,10000);
		$snowflake.css('top', "100%");
		$snowflake.css('-webkit-animation-delay', r.toString() + 'ms' );
		$snowflake.css('-moz-animation-delay', r.toString() + 'ms' );
		$snowflake.css('-0-animation-delay', r.toString() + 'ms' );
		$snowflake.css('animation-delay', r.toString() + 'ms' );
		r = getRandomInt(9, 13);
		$snowflake.css('-webkit-animation-duration', r.toString() + 's');
		$snowflake.css('-o-animation-duration', r.toString() + 's');
		$snowflake.css('-moz-animation-duration', r.toString() + 's');
		$snowflake.css('animation-duration', r.toString() + 's');
		$('body').append($snowflake);
		$snowflakes.push($snowflake);
	}
});

function createImageElement(addresses) {
	var self = document.createElement('img');
	var r = getRandomInt(0, addresses.length);
	self.src=addresses[r];
	self.className = "snowflake";
	return self;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
