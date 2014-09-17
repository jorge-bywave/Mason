/////////////////////////////////////////
//
//	MasonJS
//	Version 1.5
//	Author: Drew Dahlman ( www.drewdahlman.com )
// 	MIT License
//
/////////////////////////////////////////

(function($) {
    $.fn.mason = function(options, complete) {

        var defaults = {
            itemSelector: null,
            ratio: 0,
            boxes: 24,
            sizes: [],
            columns: [
                [0, 480, 1],
                [480, 780, 2],
                [780, 1080, 3],
                [1080, 1320, 4],
                [1320, 1680, 5]
            ],
            randomize: [],
            promoted: [],
            filler: {
                itemSelector: options.itemSelector,
                filler_class: 'mason_filler'
            },
            layout: 'none',
            gutter: 0
        };
        var timeout_id;

        /*
         * Complete Callback
         */
        if (complete) {
            var callback = {
                complete: complete
            }
        }

        var elements = {
            block: {
                height: 0,
                width: 0
            },
            fillers: [],
            columns: 0,
            zones: 0,
            zoneLists: [
                [1,4,2,3],
                [4,1,2,3],
                [2,3,1,4],
                [3,2,1,4],
            ],
            rows: 0,
            matrix: []
        };


        return this.each(function() {
            var settings, callbacks, $self;

            settings = $.extend(defaults, options);
            callbacks = $.extend(callback, complete);

            $self = $(this);

            /*
             * Create Blocks and give dimensions
             */

            function setup() {

                /*
                 * Define our container element.
                 * Note we append a clear div in order to get a height later on, VERY IMPORTANT!
                 */
                if ($self.children(".mason_clear").length < 1) {
                    $self.append("<div class='mason_clear' style='clear:both;position:relative;'></div>");
                }
                $self.children().hide();
                $self.children().removeClass('processed');

                var height = Math.floor($self.height());
                var width = Math.floor($self.width());
                var boxesHeight = Math.floor(Math.sqrt((height * width) / settings.boxes ));

                var preferredBoxesInRow = Math.round(height / boxesHeight);
                var finalBoxHeight = Math.round(height / preferredBoxesInRow);

                var preferredBoxesInCol = Math.round(width / finalBoxHeight);
                var finalBoxWidth = Math.round(width / preferredBoxesInCol);

                elements.block.height = finalBoxHeight;
                elements.block.width = finalBoxWidth;
                elements.columns = preferredBoxesInCol;
                elements.rows = preferredBoxesInRow;

                elements.zones = Math.floor(( (preferredBoxesInCol-(preferredBoxesInCol % 4)) * (preferredBoxesInRow-(preferredBoxesInRow % 4)) ) / 4);

                $(settings.filler.itemSelector).each(function(){
                    elements.fillers.push($(this).data('uid'));
                    //console.log('Uid:' + $(this).data('uid'));
                });

                // Size Elements
                sizeElements();
            };

            /*
             * Size elements according to block size and column count
             */

            function sizeElements() {
                var col = elements.columns;

                if (col == 1) {
                    $sel = $self.children(settings.itemSelector);
                    $sel.height(elements.block.height);
                    $sel.width(elements.block.width);
                    $sel.css({
                        'margin': '0px'
                    });
                } else {


                    /*
                     * Build a matrix of our data and space
                     * On inital build the grid is set to false
                     * we need to measure our blocks and determine
                     * what elements fall where
                     */
                    //var el_h = $self.height();
                    //var block_h = (el_h / elements.block.height);
                    var block_h = elements.rows;

                    elements.matrix = [];
                    for (var i = 0; i < block_h; i++) {
                        elements.matrix[i] = [];
                        for (var c = 0; c < col; c++) {
                            elements.matrix[i][c] = '';
                        }
                    }
                    //logArray(elements.matrix);

                    /*
                     * Push our promoted sizes into our sizes array ( this is for counting )
                     */
                    for (var i = 0; i < settings.promoted.length; i++) {
                        settings.sizes.push([settings.promoted[i][0], settings.promoted[i][1]])
                    }

                    /*
                     * Loop over each element, size, place, and fill out matrix information.
                     */
                    /**/
                    for (var i = 0; i < settings.randomize.length; i++) {
                        var cl = settings.randomize[i][2];
                        var size_w = settings.randomize[i][0];
                        var size_h = settings.randomize[i][1];
                        var zoneSeq = elements.zoneLists[Math.floor(Math.random() * (elements.zoneLists.length))];
                        var count = 0;
                        $self.children(settings.itemSelector+'.'+cl).each(function() {
                            $sel = $(this);

                            // pick a random number between 0 and the length of sizes ( - the promoted size! )
                            //ranX = Math.floor(Math.random() * (elements.width));
                            //ranY = Math.floor(Math.random() * (elements.height));
                            size = [size_w,size_h];

                            $sel.data('size', (size_w+1) * (size_h+1));

                            var h = parseFloat((elements.block.height * size[1]).toFixed(2));
                            h = h - (settings.gutter * 2);

                            var w = parseFloat((elements.block.width * size[0]));
                            w = w - (settings.gutter * 2);


                            var coords = getAvailableBlock(size_w,size_h,zoneSeq[count])
                            coordsX = coords[0];
                            coordsY = coords[1];
                            if(coordsX == -1 && coordsY == -1)
                                return;
                            var x = parseFloat((coordsX * elements.block.width)).toFixed(2) + settings.gutter,
                                y = parseFloat((coordsY * elements.block.height)).toFixed(2) + settings.gutter;

                            $sel.height(h + 'px');
                            $sel.width(w + 'px');




                            $sel.css({
                                'margin': (settings.gutter),
                                'top': y + 'px',
                                'left': x + 'px',
                                'position': 'absolute'
                            });

                            markNotAvailableBlock(coordsX,coordsY,size_w,size_h,$sel.data('uid'));

                            count++;
                            if(count == zoneSeq.length)
                                count = 0;

                            $sel.addClass('processed');


                        });
                    }
                    //console.log('End');
                    /**/



                    /*
                     * Create filler blocks to seal up empty spaces based on matrix
                     * This goes column by column to analyze true / false booleans in matrix
                     */
                    for (var i = 0; i < elements.matrix.length; i++) {
                        for (var c = 0; c < elements.matrix[i].length; c++) {

                            /*
                             * Blank space detected
                             */
                            if (elements.matrix[i][c] == '') {

                                // get block dimensions
                                var h = parseFloat(elements.block.height),
                                    w = parseFloat(elements.block.width);


                                // determine position
                                var x = parseFloat((i * h)).toFixed(2) + settings.gutter,
                                    y = parseFloat((c * w)).toFixed(2) + settings.gutter,
                                    ran, filler;


                                h = h - (settings.gutter * 2);
                                w = w - (settings.gutter * 2);

                                //selected = Math.floor(Math.random() * $(settings.filler.itemSelector).length);
                                var exceptionUids = getAdjacentUids(i, c);
                                ran = getFiller(exceptionUids);
                                if(ran == undefined){
                                    ran = Math.floor(Math.random() * $(settings.filler.itemSelector).length);
                                }
                                //console.log('ran:' + ran);
                                filler = $(settings.filler.itemSelector).eq(ran).clone();
                                //console.log('filler:' + filler.data('uid'));

                                filler.addClass(settings.filler.filler_class);
                                filler.css({
                                    'display': 'none',
                                    'position': 'absolute',
                                    'top': x + 'px',
                                    'left': y + 'px',
                                    'height': h + 'px',
                                    'width': w + 'px',
                                    'margin': '0px'
                                });
                                filler.addClass('processed');//.fadeIn(1000);
                                filler.appendTo($self);//.hide().fadeIn();
                                elements.matrix[i][c] = filler.data('uid');
                            }
                        }
                    }
                    //$self.children().fadeIn();
                    $self.children('.processed').each(function(){
                        $(this).fadeIn();
                    });
                    //logArray(elements.matrix);
                    if (callbacks.complete != null) {
                        callbacks.complete();
                    }
                }
            };

            /*
             * Determine Our Columns
             */

            function columnSize() {
                var w = Math.floor($self.width()),
                    cols = 0,
                    colsCount = settings.columns.length - 1;

                if (w >= settings.columns[colsCount][1]) {
                    cols = settings.columns[colsCount][2];
                } else {
                    for (var i = 0; i <= colsCount; i++) {
                        if (w > settings.columns[i][0] && w < settings.columns[i][1]) {
                            cols = settings.columns[i][2]
                        }
                    }
                }
                return cols;
            };

            function getAdjacentUids(x,y){
                var uids = [];
                if(elements.matrix[x - 1] != undefined && elements.matrix[x - 1][y] != undefined && elements.matrix[x - 1][y] != "")
                    uids.push(elements.matrix[x - 1][y]);
                if(elements.matrix[x + 1] != undefined && elements.matrix[x + 1][y] != undefined && elements.matrix[x + 1][y] != "")
                    uids.push(elements.matrix[x + 1][y]);
                if(elements.matrix[x] != undefined && elements.matrix[x][y - 1] != undefined && elements.matrix[x][y - 1] != "")
                    uids.push(elements.matrix[x][y - 1]);
                if(elements.matrix[x] != undefined && elements.matrix[x][y + 1] != undefined && elements.matrix[x][y + 1] != "")
                    uids.push(elements.matrix[x][y + 1]);

                return uids;
            };

            function getAvailableBlock(size_w,size_h,zone)
            {
                var foundSpot = false,
                    ranX,
                    ranY,
                    startX=0,
                    startY= 0,
                    tries = 0;
                switch(zone){
                    case 2:
                        startX = Math.floor(elements.columns/2);
                        break;
                    case 3:
                        startY = Math.floor(elements.rows/2);
                        break;
                    case 4:
                        startX = Math.floor(elements.columns/2);
                        startY = Math.floor(elements.rows/2);
                        break;
                }
                while(!foundSpot){
                    if(zone != 0){
                        ranX = Math.floor(Math.random() * Math.floor(elements.columns/2)) + startX;
                        ranY = Math.floor(Math.random() * Math.floor(elements.rows/2)) + startY;
                    }else{
                        ranX = Math.floor(Math.random() * elements.columns);
                        ranY = Math.floor(Math.random() * elements.rows);
                    }
                    //console.log('Generated ranY ' + ranY);
                    if( (ranX + (size_w -1)) >= elements.columns)
                        ranX = elements.columns - size_w;
                    if( (ranY + (size_h -1)) >= elements.rows)
                        ranY = elements.rows - size_h;
                    var free = true;

                    for(i = ranY; i < (ranY + (size_h )); i++){
                        free = true;
                        for(j = ranX; j < (ranX + (size_w )); j++){
                            if(elements.matrix[i][j] !== ''){
                                free = false;
                                break;
                            }
                        }
                        if(free == false){
                            break;
                        }
                    }
                    if(free == true){
                        foundSpot = true;
                    }
                    tries++;
                    if(tries == 5 && zone != 0){
                        zone = 0;
                    }
                    if(tries >= 15)
                        return [-1, -1];
                }

                return [ranX, ranY];

            }
            function markNotAvailableBlock(x,y,size_w,size_h,uid)
            {
                for(i = y; i < (y + (size_h )); i++){

                    for(j = x; j < (x + (size_w )); j++){
                        elements.matrix[i][j] = uid;
                    }
                }
            }

            function getFiller(exceptions){
                var qualifiedFillers = [];
                for(i in elements.fillers){
                    if($.inArray(elements.fillers[i], exceptions) == -1)
                    {
                        qualifiedFillers.push(i);
                    }
                }
                ran = Math.floor(Math.random() * qualifiedFillers.length);
                //console.log('Checking qualifiedFillers');
                //for(i in qualifiedFillers)
                //{
                //    console.log(elements.fillers[qualifiedFillers[i]]);
                //}
                //console.log('Checking qualifiedFillers: end');
                //console.log('Selected uid:' + elements.fillers[qualifiedFillers[ran]]);
                return qualifiedFillers[ran];
            };

            function logArray(array){
                for (var i = 0; i < array.length; i++) {
                    for (var c = 0; c < array[i].length; c++) {
                        console.log('Matrix value['+i+']['+c+']' + array[i][c]);
                    }
                }
            };

            /*
             * Baked in utils
             */
            var waitForFinalEvent = (function() {
                var timers = {};
                return function(callback, ms, uniqueId) {
                    if (!uniqueId) {
                        uniqueId = random();
                    }
                    if (timers[uniqueId]) {
                        clearTimeout(timers[uniqueId]);
                    }
                    timers[uniqueId] = setTimeout(callback, ms);
                };
            })();
            var random = function() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 5; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            }
            // check layout

            if (settings.layout == "fluid") {
                $(window).resize(function() {
                    clearTimeout(timeout_id);
                    console.log('Timeout ID: ' + timeout_id);
                    timeout_id = setTimeout(function(){
                        $('.' + settings.filler.filler_class).remove();
                        elements.matrix = [];
                        waitForFinalEvent(function() {
                            $('.' + settings.filler.filler_class).remove();
                            setup();
                        }, 150);
                        console.log('Finished resizing');
                    },500);
                });
            }
            setup();
        });
    };
})(jQuery);