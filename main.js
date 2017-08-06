/*!	
		* FitText.js 1.0 jQuery free version
		*
		* Copyright 2011, Dave Rupert http://daverupert.com 
		* Released under the WTFPL license 
		* http://sam.zoy.org/wtfpl/
		* Modified by Slawomir Kolodziej http://slawekk.info
		*
		* Date: Tue Aug 09 2011 10:45:54 GMT+0200 (CEST)
		*/
		(function(){
		  var css = function (el, prop) {
		    return window.getComputedStyle ? getComputedStyle(el).getPropertyValue(prop) : el.currentStyle[prop];
		  };
		  
		  var addEvent = function (el, type, fn) {
		    if (el.addEventListener)
		      el.addEventListener(type, fn, false);
				else
					el.attachEvent('on'+type, fn);
		  };
		  
		  var extend = function(obj,ext){
		    for(var key in ext)
		      if(ext.hasOwnProperty(key))
		        obj[key] = ext[key];
		    return obj;
		  };

		  window.fitText = function (el, kompressor, options) {

		    var settings = extend({
		      'minFontSize' : -1/0,
		      'maxFontSize' : 1/0
		    },options);

		    var fit = function (el) {
		      var compressor = kompressor || 1.2;

		      var resizer = function () {
		        el.style.fontSize = Math.max(Math.min(el.clientWidth / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)) + 'px';
		      };

		      // Call once to set.
		      resizer();

		      // Bind events
		      // If you have any js library which support Events, replace this part
		      // and remove addEvent function (or use original jQuery version)
		      addEvent(window, 'resize', resizer);
		    };

		    if (el.length)
		      for(var i=0; i<el.length; i++)
		        fit(el[i]);
		    else
		      fit(el);
 
		    // return set of elements
		    return el;
		  };
		})();


		// Change text in intervals
		var text = [
				"working",
				"absent",
				"coding",
				"stressed",
				"drawing",
				"resting",
				"loving",
				"designing",
				"awayyy",
				"surfing",
				"losing it",
				"animating"
			];		
	    var textCounter = 0;   	   
	    var textElem = document.getElementById("changing-action");
	    setInterval(changeText, 3000);	    
	    function changeText() {
	     	textElem.innerHTML = text[textCounter];
	        textCounter++;
	        if(textCounter >= text.length) { textCounter = 0; }
	    }	    

	    // change background image in intervals 
	    // var bg = ["static2", "static3", "static4", "static5", "static6", "static1"];
	    var bg = ["blobs1", "blobs2"];
	    var bgCounter = 0;
	    var bgElem1 = document.getElementById("changing-background1");
	    // var bgElem2 = document.getElementById("changing-background2");
	    // var isWebkit = 'WebkitAppearance' in document.documentElement.style;
	    setInterval(changeBG, 6000);
	    function changeBG() {
	     	bgElem1.style.backgroundImage = "url('/images/" + bg[bgCounter] + ".gif')";	     	
	     	// if (isWebkit === true) {
	     	// 	bgElem2.style.backgroundImage = "url('/images/" + bg[bgCounter] + ".gif')";
	     	// };	     	
	        bgCounter++;
	        if(bgCounter >= bg.length) { bgCounter = 0; }
	    }

		window.fitText( document.getElementById("responsive_headline") );

		// window.onload = function (){
			
		// }