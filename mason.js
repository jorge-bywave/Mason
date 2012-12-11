/*
 * MASON.js
 * Author: Drew Dahlman ( www.drewdahlman.com )
 * Version: 1.0
*/

(function($){
	$.fn.mason = function(options,callback) {

		var defaults = {
			itemSelector: null,
			ratio: 0,
			sizes: [],
			columns: [
				[0,480,1],
				[480,780,2],
				[780,1080,3],
				[1080,1320,4],
				[1320,1680,5]
			],
			promoted: [],
			filler: {
				itemSelector: options.itemSelector
			} 
		}

		var elements = {
			block: {
				height: 0,
				width: 0
			},
			matrix: []
		}

		return this.each(function() {
			var settings = $.extend(defaults,options);
			var callbacks = $.extend(callback,callback);

			var $self = $(this);

			/*
			 * Create Blocks and give dimensions
			*/
			function setup(){

				/*
				 * Define our container element.
				 * Note we append a clear div in order to get a height later on, VERY IMPORTANT!
			    */
				$self.width($self.width());
				$self.append("<div class='mason_clear' style='clear:both;position:relative;'></div>")
				elements.block.height = (( $self.width() / columnSize() ) / settings.ratio ).toFixed(0);
				elements.block.width = ( $self.width() / columnSize() );

				// Size Elements
				sizeElements();
			}

			/*
			 * Size elements according to block size and column count
			*/
			function sizeElements(){
				var col = columnSize();

				if( col == 1){
					$sel = $(settings.itemSelector);
					$sel.height(elements.block.height);
					$sel.width(elements.block.width);
				}
				else {

					
					/*
					 * Push our promoted sizes into our sizes array ( this is for counting )
					*/
					for(var i = 0; i < settings.promoted.length; i++){
						settings.sizes.push([settings.promoted[i][0],settings.promoted[i][1]])
					}

					/*
					 * Loop over each element, size, place, and fill out matrix information.
					*/

					$(settings.itemSelector).each(function(){
						$sel = $(this);
						
						// pick a random number between 0 and the length of sizes ( - the promoted size! )
						ran = Math.floor( Math.random() * (settings.sizes.length - settings.promoted.length) );
						ranSize = settings.sizes[ran];

						for(var i = 0; i < settings.promoted.length; i++){
							if( $sel.hasClass(settings.promoted[i][2]) ){
								ranSize = [settings.promoted[i][0],settings.promoted[i][1]];
								ran = (settings.sizes.length-1) + i;
							}
						}

						$sel.data('size',ran);

						var h = ( elements.block.height * ranSize[1] ).toFixed(2);
						var w = ( elements.block.width * ranSize[0] );

						$sel.height(h+'px');
						$sel.width(w+'px');
					});

					/*
					 * Build a matrix of our data and space
					 * On inital build the grid is set to false
					 * we need to measure our blocks and determine
					 * what elements fall where
					*/
					var el_h = $self.height();
					var block_h = ( el_h / elements.block.height );

					for(var i = 0; i < block_h; i++){
						elements.matrix[i] = [];
						for(var c = 0; c < col; c++){
							elements.matrix[i][c] = false;
						}
					}

					/*
					 * Populate the matrix
					*/
					$(settings.itemSelector).each(function(){
						$sel = $(this);

						// Start by calculating the position based on block dimensions
						// @ t = top ( row )
						// @ l = left ( column )
						var l = Math.round($sel.position().left / elements.block.width);
						var t = Math.round($sel.position().top / elements.block.height);
						
						// turn the data size into a number
						var s = parseFloat($sel.data('size'));

						// now determine size of the element based on block dimensions and total area
						var h = settings.sizes[s][1];
						var w = settings.sizes[s][0];
						var a = h*w;

						// Loop through the elements area and based on the size
						// populate the matrix.
						// Start with rows move to columns
						for(var i = 0; i < a; i++){
							for(var bh = 0; bh < h; bh++){
								elements.matrix[t+bh][l] = true;
								for(var bw = 0; bw < w; bw++){
									elements.matrix[t+bh][l+bw] = true;
								}
							}
						}
					});

					/*
					 * Create filler blocks to seal up empty spaces based on matrix
					 * This goes column by column to analyze true / false booleans in matrix
					*/
					for(var i = 0; i < elements.matrix.length; i ++){
						for(var c = 0; c < elements.matrix[i].length; c++){

							/*
							 * Blank space detected
							*/
							if( elements.matrix[i][c] == false){

								// get block dimensions
								var h = elements.block.height, 
									w = elements.block.width;

								// determine position
								var x = ( i * h ).toFixed(2), 
									y = c * w,
									ran,filler;
								ran = Math.floor( Math.random() * $(settings.filler.itemSelector).length );
								filler = $(settings.filler.itemSelector).eq(ran).clone();

								filler.addClass('filler');
								filler.css({'position':'absolute','top':x+'px','left':y+'px','height':h+'px','width':w+'px'});

								filler.appendTo($self);
							}
						}
					}
				}
			}

			/*
			 * Determine Our Columns
			*/
			function columnSize(){
				var w = Math.floor($self.width()),cols = 0,colsCount = settings.columns.length - 1;

				if( w > settings.columns[colsCount][1]){
					cols = settings.columns[colsCount][2];
				}
				else {
					for(var i = 0; i <= colsCount; i++){
						if( w > settings.columns[i][0] && w < settings.columns[i][1]){
							cols = settings.columns[i][2]
						}
					}
				}
				return cols;
			}

			setup();
		});
	};
})(jQuery);/*
 * MASON.js
 * Author: Drew Dahlman ( www.drewdahlman.com )
 * Version: 1.0
*/

(function($){
	$.fn.mason = function(options,callback) {

		var defaults = {
			itemSelector: null,
			ratio: 0,
			sizes: [],
			columns: [
				[0,480,1],
				[480,780,2],
				[780,1080,3],
				[1080,1320,4],
				[1320,1680,5]
			],
			promoted: [],
			filler: {
				itemSelector: options.itemSelector
			} 
		};

		var elements = {
			block: {
				height: 0,
				width: 0
			},
			matrix: []
		};

		return this.each(function() {
			var settings = $.extend(defaults,options);
			var callbacks = $.extend(callback,callback);

			var $self = $(this);

			/*
			 * Create Blocks and give dimensions
			*/
			function setup(){

				/*
				 * Define our container element.
				 * Note we append a clear div in order to get a height later on, VERY IMPORTANT!
			    */
				$self.width($self.width());
				$self.append("<div class='mason_clear' style='clear:both;position:relative;'></div>")
				elements.block.height = (( $self.width() / columnSize() ) / settings.ratio ).toFixed(0);
				elements.block.width = ( $self.width() / columnSize() );

				// Size Elements
				sizeElements();
			};

			/*
			 * Size elements according to block size and column count
			*/
			function sizeElements(){
				var col = columnSize();

				if( col == 1){
					$sel = $(settings.itemSelector);
					$sel.height(elements.block.height);
					$sel.width(elements.block.width);
				}
				else {

					
					/*
					 * Push our promoted sizes into our sizes array ( this is for counting )
					*/
					for(var i = 0; i < settings.promoted.length; i++){
						settings.sizes.push([settings.promoted[i][0],settings.promoted[i][1]])
					}

					/*
					 * Loop over each element, size, place, and fill out matrix information.
					*/

					$(settings.itemSelector).each(function(){
						$sel = $(this);
						
						// pick a random number between 0 and the length of sizes ( - the promoted size! )
						ran = Math.floor( Math.random() * (settings.sizes.length - settings.promoted.length) );
						ranSize = settings.sizes[ran];

						for(var i = 0; i < settings.promoted.length; i++){
							if( $sel.hasClass(settings.promoted[i][2]) ){
								ranSize = [settings.promoted[i][0],settings.promoted[i][1]];
								ran = (settings.sizes.length-1) + i;
							}
						}

						$sel.data('size',ran);

						var h = ( elements.block.height * ranSize[1] ).toFixed(2);
						var w = ( elements.block.width * ranSize[0] );

						$sel.height(h+'px');
						$sel.width(w+'px');
					});

					/*
					 * Build a matrix of our data and space
					 * On inital build the grid is set to false
					 * we need to measure our blocks and determine
					 * what elements fall where
					*/
					var el_h = $self.height();
					var block_h = ( el_h / elements.block.height );

					for(var i = 0; i < block_h; i++){
						elements.matrix[i] = [];
						for(var c = 0; c < col; c++){
							elements.matrix[i][c] = false;
						}
					}

					/*
					 * Populate the matrix
					*/
					$(settings.itemSelector).each(function(){
						$sel = $(this);

						// Start by calculating the position based on block dimensions
						// @ t = top ( row )
						// @ l = left ( column )
						var l = Math.round($sel.position().left / elements.block.width);
						var t = Math.round($sel.position().top / elements.block.height);
						
						// turn the data size into a number
						var s = parseFloat($sel.data('size'));

						// now determine size of the element based on block dimensions and total area
						var h = settings.sizes[s][1];
						var w = settings.sizes[s][0];
						var a = h*w;

						// Loop through the elements area and based on the size
						// populate the matrix.
						// Start with rows move to columns
						for(var i = 0; i < a; i++){
							for(var bh = 0; bh < h; bh++){
								elements.matrix[t+bh][l] = true;
								for(var bw = 0; bw < w; bw++){
									elements.matrix[t+bh][l+bw] = true;
								}
							}
						}
					});

					/*
					 * Create filler blocks to seal up empty spaces based on matrix
					 * This goes column by column to analyze true / false booleans in matrix
					*/
					for(var i = 0; i < elements.matrix.length; i ++){
						for(var c = 0; c < elements.matrix[i].length; c++){

							/*
							 * Blank space detected
							*/
							if( elements.matrix[i][c] == false){

								// get block dimensions
								var h = elements.block.height, 
									w = elements.block.width;

								// determine position
								var x = ( i * h ).toFixed(2), 
									y = c * w,
									ran,filler;
								ran = Math.floor( Math.random() * $(settings.filler.itemSelector).length );
								filler = $(settings.filler.itemSelector).eq(ran).clone();

								filler.addClass('filler');
								filler.css({'position':'absolute','top':x+'px','left':y+'px','height':h+'px','width':w+'px'});

								filler.appendTo($self);
							}
						}
					}
				}
			};

			/*
			 * Determine Our Columns
			*/
			function columnSize(){
				var w = Math.floor($self.width()),cols = 0,colsCount = settings.columns.length - 1;

				if( w > settings.columns[colsCount][1]){
					cols = settings.columns[colsCount][2];
				}
				else {
					for(var i = 0; i <= colsCount; i++){
						if( w > settings.columns[i][0] && w < settings.columns[i][1]){
							cols = settings.columns[i][2]
						}
					}
				}
				return cols;
			};

			setup();
		});
	};
})(jQuery);/*
 * MASON.js
 * Author: Drew Dahlman ( www.drewdahlman.com )
 * Version: 1.0
*/

(function($){
	$.fn.mason = function(options,callback) {

		var defaults = {
			itemSelector: null,
			ratio: 0,
			sizes: [],
			columns: [
				[0,480,1],
				[480,780,2],
				[780,1080,3],
				[1080,1320,4],
				[1320,1680,5]
			],
			promoted: [],
			filler: {
				itemSelector: options.itemSelector
			} 
		};

		var elements = {
			block: {
				height: 0,
				width: 0
			},
			matrix: []
		};

		return this.each(function() {
			var settings = $.extend(defaults,options);
			var callbacks = $.extend(callback,callback);

			var $self = $(this);

			/*
			 * Create Blocks and give dimensions
			*/
			function setup(){

				/*
				 * Define our container element.
				 * Note we append a clear div in order to get a height later on, VERY IMPORTANT!
			    */
				$self.width($self.width());
				$self.append("<div class='mason_clear' style='clear:both;position:relative;'></div>")
				elements.block.height = (( $self.width() / columnSize() ) / settings.ratio ).toFixed(0);
				elements.block.width = ( $self.width() / columnSize() );

				// Size Elements
				sizeElements();
			};

			/*
			 * Size elements according to block size and column count
			*/
			function sizeElements(){
				var col = columnSize();

				if( col == 1){
					$sel = $(settings.itemSelector);
					$sel.height(elements.block.height);
					$sel.width(elements.block.width);
				}
				else {

					
					/*
					 * Push our promoted sizes into our sizes array ( this is for counting )
					*/
					for(var i = 0; i < settings.promoted.length; i++){
						settings.sizes.push([settings.promoted[i][0],settings.promoted[i][1]])
					}

					/*
					 * Loop over each element, size, place, and fill out matrix information.
					*/

					$(settings.itemSelector).each(function(){
						$sel = $(this);
						
						// pick a random number between 0 and the length of sizes ( - the promoted size! )
						ran = Math.floor( Math.random() * (settings.sizes.length - settings.promoted.length) );
						ranSize = settings.sizes[ran];

						for(var i = 0; i < settings.promoted.length; i++){
							if( $sel.hasClass(settings.promoted[i][2]) ){
								ranSize = [settings.promoted[i][0],settings.promoted[i][1]];
								ran = (settings.sizes.length-1) + i;
							}
						}

						$sel.data('size',ran);

						var h = ( elements.block.height * ranSize[1] ).toFixed(2);
						var w = ( elements.block.width * ranSize[0] );

						$sel.height(h+'px');
						$sel.width(w+'px');
					});

					/*
					 * Build a matrix of our data and space
					 * On inital build the grid is set to false
					 * we need to measure our blocks and determine
					 * what elements fall where
					*/
					var el_h = $self.height();
					var block_h = ( el_h / elements.block.height );

					for(var i = 0; i < block_h; i++){
						elements.matrix[i] = [];
						for(var c = 0; c < col; c++){
							elements.matrix[i][c] = false;
						}
					}

					/*
					 * Populate the matrix
					*/
					$(settings.itemSelector).each(function(){
						$sel = $(this);

						// Start by calculating the position based on block dimensions
						// @ t = top ( row )
						// @ l = left ( column )
						var l = Math.round($sel.position().left / elements.block.width);
						var t = Math.round($sel.position().top / elements.block.height);
						
						// turn the data size into a number
						var s = parseFloat($sel.data('size'));

						// now determine size of the element based on block dimensions and total area
						var h = settings.sizes[s][1];
						var w = settings.sizes[s][0];
						var a = h*w;

						// Loop through the elements area and based on the size
						// populate the matrix.
						// Start with rows move to columns
						for(var i = 0; i < a; i++){
							for(var bh = 0; bh < h; bh++){
								elements.matrix[t+bh][l] = true;
								for(var bw = 0; bw < w; bw++){
									elements.matrix[t+bh][l+bw] = true;
								}
							}
						}
					});

					/*
					 * Create filler blocks to seal up empty spaces based on matrix
					 * This goes column by column to analyze true / false booleans in matrix
					*/
					for(var i = 0; i < elements.matrix.length; i ++){
						for(var c = 0; c < elements.matrix[i].length; c++){

							/*
							 * Blank space detected
							*/
							if( elements.matrix[i][c] == false){

								// get block dimensions
								var h = elements.block.height, 
									w = elements.block.width;

								// determine position
								var x = ( i * h ).toFixed(2), 
									y = c * w,
									ran,filler;
								ran = Math.floor( Math.random() * $(settings.filler.itemSelector).length );
								filler = $(settings.filler.itemSelector).eq(ran).clone();

								filler.addClass('filler');
								filler.css({'position':'absolute','top':x+'px','left':y+'px','height':h+'px','width':w+'px'});

								filler.appendTo($self);
							}
						}
					}
				}
			};

			/*
			 * Determine Our Columns
			*/
			function columnSize(){
				var w = Math.floor($self.width()),cols = 0,colsCount = settings.columns.length - 1;

				if( w > settings.columns[colsCount][1]){
					cols = settings.columns[colsCount][2];
				}
				else {
					for(var i = 0; i <= colsCount; i++){
						if( w > settings.columns[i][0] && w < settings.columns[i][1]){
							cols = settings.columns[i][2]
						}
					}
				}
				return cols;
			};

			setup();
		});
	};
})(jQuery);/*
 * MASON.js
 * Author: Drew Dahlman ( www.drewdahlman.com )
 * Version: 1.0
*/

(function($){
	$.fn.mason = function(options,callback) {

		var defaults = {
			itemSelector: null,
			ratio: 0,
			sizes: [],
			columns: [
				[0,480,1],
				[480,780,2],
				[780,1080,3],
				[1080,1320,4],
				[1320,1680,5]
			],
			promoted: [],
			filler: {
				itemSelector: options.itemSelector
			} 
		};

		var elements = {
			block: {
				height: 0,
				width: 0
			},
			matrix: []
		};

		return this.each(function() {
			var settings = $.extend(defaults,options);
			var callbacks = $.extend(callback,callback);

			var $self = $(this);

			/*
			 * Create Blocks and give dimensions
			*/
			function setup(){

				/*
				 * Define our container element.
				 * Note we append a clear div in order to get a height later on, VERY IMPORTANT!
			    */
				$self.width($self.width());
				$self.append("<div class='mason_clear' style='clear:both;position:relative;'></div>")
				elements.block.height = (( $self.width() / columnSize() ) / settings.ratio ).toFixed(0);
				elements.block.width = ( $self.width() / columnSize() );

				// Size Elements
				sizeElements();
			};

			/*
			 * Size elements according to block size and column count
			*/
			function sizeElements(){
				var col = columnSize();

				if( col == 1){
					$sel = $(settings.itemSelector);
					$sel.height(elements.block.height);
					$sel.width(elements.block.width);
				}
				else {

					
					/*
					 * Push our promoted sizes into our sizes array ( this is for counting )
					*/
					for(var i = 0; i < settings.promoted.length; i++){
						settings.sizes.push([settings.promoted[i][0],settings.promoted[i][1]])
					}

					/*
					 * Loop over each element, size, place, and fill out matrix information.
					*/

					$(settings.itemSelector).each(function(){
						$sel = $(this);
						
						// pick a random number between 0 and the length of sizes ( - the promoted size! )
						ran = Math.floor( Math.random() * (settings.sizes.length - settings.promoted.length) );
						ranSize = settings.sizes[ran];

						for(var i = 0; i < settings.promoted.length; i++){
							if( $sel.hasClass(settings.promoted[i][2]) ){
								ranSize = [settings.promoted[i][0],settings.promoted[i][1]];
								ran = (settings.sizes.length-1) + i;
							}
						}

						$sel.data('size',ran);

						var h = ( elements.block.height * ranSize[1] ).toFixed(2);
						var w = ( elements.block.width * ranSize[0] );

						$sel.height(h+'px');
						$sel.width(w+'px');
					});

					/*
					 * Build a matrix of our data and space
					 * On inital build the grid is set to false
					 * we need to measure our blocks and determine
					 * what elements fall where
					*/
					var el_h = $self.height();
					var block_h = ( el_h / elements.block.height );

					for(var i = 0; i < block_h; i++){
						elements.matrix[i] = [];
						for(var c = 0; c < col; c++){
							elements.matrix[i][c] = false;
						}
					}

					/*
					 * Populate the matrix
					*/
					$(settings.itemSelector).each(function(){
						$sel = $(this);

						// Start by calculating the position based on block dimensions
						// @ t = top ( row )
						// @ l = left ( column )
						var l = Math.round($sel.position().left / elements.block.width);
						var t = Math.round($sel.position().top / elements.block.height);
						
						// turn the data size into a number
						var s = parseFloat($sel.data('size'));

						// now determine size of the element based on block dimensions and total area
						var h = settings.sizes[s][1];
						var w = settings.sizes[s][0];
						var a = h*w;

						// Loop through the elements area and based on the size
						// populate the matrix.
						// Start with rows move to columns
						for(var i = 0; i < a; i++){
							for(var bh = 0; bh < h; bh++){
								elements.matrix[t+bh][l] = true;
								for(var bw = 0; bw < w; bw++){
									elements.matrix[t+bh][l+bw] = true;
								}
							}
						}
					});

					/*
					 * Create filler blocks to seal up empty spaces based on matrix
					 * This goes column by column to analyze true / false booleans in matrix
					*/
					for(var i = 0; i < elements.matrix.length; i ++){
						for(var c = 0; c < elements.matrix[i].length; c++){

							/*
							 * Blank space detected
							*/
							if( elements.matrix[i][c] == false){

								// get block dimensions
								var h = elements.block.height, 
									w = elements.block.width;

								// determine position
								var x = ( i * h ).toFixed(2), 
									y = c * w,
									ran,filler;
								ran = Math.floor( Math.random() * $(settings.filler.itemSelector).length );
								filler = $(settings.filler.itemSelector).eq(ran).clone();

								filler.addClass('filler');
								filler.css({'position':'absolute','top':x+'px','left':y+'px','height':h+'px','width':w+'px'});

								filler.appendTo($self);
							}
						}
					}
				}
			};

			/*
			 * Determine Our Columns
			*/
			function columnSize(){
				var w = Math.floor($self.width()),cols = 0,colsCount = settings.columns.length - 1;

				if( w > settings.columns[colsCount][1]){
					cols = settings.columns[colsCount][2];
				}
				else {
					for(var i = 0; i <= colsCount; i++){
						if( w > settings.columns[i][0] && w < settings.columns[i][1]){
							cols = settings.columns[i][2]
						}
					}
				}
				return cols;
			};

			setup();
		});
	};
})(jQuery);/*
 * MASON.js
 * Author: Drew Dahlman ( www.drewdahlman.com )
 * Version: 1.0
*/

(function($){
	$.fn.mason = function(options,callback) {

		var defaults = {
			itemSelector: null,
			ratio: 0,
			sizes: [],
			columns: [
				[0,480,1],
				[480,780,2],
				[780,1080,3],
				[1080,1320,4],
				[1320,1680,5]
			],
			promoted: [],
			filler: {
				itemSelector: options.itemSelector
			} 
		};

		var elements = {
			block: {
				height: 0,
				width: 0
			},
			matrix: []
		};

		return this.each(function() {
			var settings = $.extend(defaults,options);
			var callbacks = $.extend(callback,callback);

			var $self = $(this);

			/*
			 * Create Blocks and give dimensions
			*/
			function setup(){

				/*
				 * Define our container element.
				 * Note we append a clear div in order to get a height later on, VERY IMPORTANT!
			    */
				$self.width($self.width());
				$self.append("<div class='mason_clear' style='clear:both;position:relative;'></div>")
				elements.block.height = (( $self.width() / columnSize() ) / settings.ratio ).toFixed(0);
				elements.block.width = ( $self.width() / columnSize() );

				// Size Elements
				sizeElements();
			};

			/*
			 * Size elements according to block size and column count
			*/
			function sizeElements(){
				var col = columnSize();

				if( col == 1){
					$sel = $(settings.itemSelector);
					$sel.height(elements.block.height);
					$sel.width(elements.block.width);
				}
				else {

					
					/*
					 * Push our promoted sizes into our sizes array ( this is for counting )
					*/
					for(var i = 0; i < settings.promoted.length; i++){
						settings.sizes.push([settings.promoted[i][0],settings.promoted[i][1]])
					}

					/*
					 * Loop over each element, size, place, and fill out matrix information.
					*/

					$(settings.itemSelector).each(function(){
						$sel = $(this);
						
						// pick a random number between 0 and the length of sizes ( - the promoted size! )
						ran = Math.floor( Math.random() * (settings.sizes.length - settings.promoted.length) );
						ranSize = settings.sizes[ran];

						for(var i = 0; i < settings.promoted.length; i++){
							if( $sel.hasClass(settings.promoted[i][2]) ){
								ranSize = [settings.promoted[i][0],settings.promoted[i][1]];
								ran = (settings.sizes.length-1) + i;
							}
						}

						$sel.data('size',ran);

						var h = ( elements.block.height * ranSize[1] ).toFixed(2);
						var w = ( elements.block.width * ranSize[0] );

						$sel.height(h+'px');
						$sel.width(w+'px');
					});

					/*
					 * Build a matrix of our data and space
					 * On inital build the grid is set to false
					 * we need to measure our blocks and determine
					 * what elements fall where
					*/
					var el_h = $self.height();
					var block_h = ( el_h / elements.block.height );

					for(var i = 0; i < block_h; i++){
						elements.matrix[i] = [];
						for(var c = 0; c < col; c++){
							elements.matrix[i][c] = false;
						}
					}

					/*
					 * Populate the matrix
					*/
					$(settings.itemSelector).each(function(){
						$sel = $(this);

						// Start by calculating the position based on block dimensions
						// @ t = top ( row )
						// @ l = left ( column )
						var l = Math.round($sel.position().left / elements.block.width);
						var t = Math.round($sel.position().top / elements.block.height);
						
						// turn the data size into a number
						var s = parseFloat($sel.data('size'));

						// now determine size of the element based on block dimensions and total area
						var h = settings.sizes[s][1];
						var w = settings.sizes[s][0];
						var a = h*w;

						// Loop through the elements area and based on the size
						// populate the matrix.
						// Start with rows move to columns
						for(var i = 0; i < a; i++){
							for(var bh = 0; bh < h; bh++){
								elements.matrix[t+bh][l] = true;
								for(var bw = 0; bw < w; bw++){
									elements.matrix[t+bh][l+bw] = true;
								}
							}
						}
					});

					/*
					 * Create filler blocks to seal up empty spaces based on matrix
					 * This goes column by column to analyze true / false booleans in matrix
					*/
					for(var i = 0; i < elements.matrix.length; i ++){
						for(var c = 0; c < elements.matrix[i].length; c++){

							/*
							 * Blank space detected
							*/
							if( elements.matrix[i][c] == false){

								// get block dimensions
								var h = elements.block.height, 
									w = elements.block.width;

								// determine position
								var x = ( i * h ).toFixed(2), 
									y = c * w,
									ran,filler;
								ran = Math.floor( Math.random() * $(settings.filler.itemSelector).length );
								filler = $(settings.filler.itemSelector).eq(ran).clone();

								filler.addClass('filler');
								filler.css({'position':'absolute','top':x+'px','left':y+'px','height':h+'px','width':w+'px'});

								filler.appendTo($self);
							}
						}
					}
				}
			};

			/*
			 * Determine Our Columns
			*/
			function columnSize(){
				var w = Math.floor($self.width()),cols = 0,colsCount = settings.columns.length - 1;

				if( w > settings.columns[colsCount][1]){
					cols = settings.columns[colsCount][2];
				}
				else {
					for(var i = 0; i <= colsCount; i++){
						if( w > settings.columns[i][0] && w < settings.columns[i][1]){
							cols = settings.columns[i][2]
						}
					}
				}
				return cols;
			};

			setup();
		});
	};
})(jQuery);