/*!
	Timeline
	Designed and built by Zach Wise at VéritéCo

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    http://www.gnu.org/licenses/

*/  

/* 	CodeKit Import
	http://incident57.com/codekit/
================================================== */
// @codekit-prepend "VMM.Timeline.License.js";

// @codekit-prepend "Core/VMM.js";
// @codekit-prepend "Core/VMM.Library.js";
// @codekit-prepend "Core/VMM.Browser.js";
// @codekit-prepend "Core/VMM.FileExtention.js";
// @codekit-prepend "Core/VMM.Date.js";
// @codekit-prepend "Core/VMM.Util.js";
// @codekit-prepend "Core/VMM.LoadLib.js";

// @codekit-prepend "Media/VMM.ExternalAPI.js";
// @codekit-prepend "Media/VMM.MediaElement.js";
// @codekit-prepend "Media/VMM.MediaType.js";
// @codekit-prepend "Media/VMM.Media.js";
// @codekit-prepend "Media/VMM.TextElement.js";

// @codekit-prepend "Slider/VMM.TouchSlider.js";
// @codekit-prepend "Slider/VMM.DragSlider.js";
// @codekit-prepend "Slider/VMM.Slider.js";
// @codekit-prepend "Slider/VMM.Slider.Slide.js";

// @codekit-prepend "VMM.Language.js";

// @codekit-append "VMM.Timeline.TimeNav.js";
// @codekit-append "VMM.Timeline.DataObj.js";

// @codekit-prepend "lib/AES.js";
// @codekit-prepend "lib/bootstrap-tooltip.js";




/* Timeline
================================================== */

if(typeof VMM != 'undefined' && typeof VMM.Timeline == 'undefined') {
	
	VMM.Timeline = function(w, h, conf, _timeline_id) {

		var $timeline, $feedback, $messege, slider, timenav, version, timeline_id;
		var events = {}, data = {}, _dates = [], config = {}, filter = {};
		var has_width = false, has_height = false, ie7 = false;
		
		if (type.of(_timeline_id) == "string") {
			timeline_id = 			_timeline_id;
		} else {
			timeline_id = 			"#timeline";
		}
		
		version = 					"1.51";
		
		trace("TIMELINE VERSION " + version);
		
		/* CONFIG
		================================================== */
		config = {
			embed:					false,
			events: {
				data_ready:		"DATAREADY",
				messege:		"MESSEGE",
				headline:		"TIMELINE_HEADLINE",
				slide_change:	"SLIDE_CHANGE",
				resize:			"resize",
                apply_filter:   "APPLY_FILTER",
				go_to_event:    "GO_TO_EVENT"
			},
			id: 					timeline_id,
			type: 					"timeline",
			maptype: 				"toner",
			preload:				4,
			current_slide:			0,
			hash_bookmark:			false,
			start_at_end: 			false,
			start_page: 			false,
			api_keys: {
				google:				"",
				flickr:				"",
				twitter:			""
			},
			interval: 				10,
			something: 				0,
			width: 					960,
			height: 				540,
			spacing: 				15,
			loaded: {
				slider: 			false, 
				timenav: 			false, 
				percentloaded: 		0
			},
			nav: {
				start_page: 		false,
				interval_width: 	200,
				density: 			2,
				minor_width: 		0,
				minor_left:			0,
				multiplier: {
					current: 		14,
					min: 			.1,
					max: 			50
				},
				rows: 				[1, 1, 1],
				width: 				960,
				height: 			500,
				marker: {
					width: 			180,
					height: 		30
				}
			},
			feature: {
				width: 				960,
				height: 			540
			},
			slider: {
				width: 				720,
				height: 			400,
				content: {
					width: 			720,
					height: 		400,
					padding: 		130
				},
				nav: {
					width: 			100,
					height: 		500
				}
			},
			ease: 					"easeInOutExpo",
			duration: 				1000,
			language: 				VMM.Language
		};
		
		if ( w != null && w != "") {
			config.width = w;
			has_width = true;
		} 

		if ( h != null && h != "") {
			config.height = h;
			has_height = true;
		}
		
		window.onhashchange = function () {
			if (config.hash_bookmark) {
				var uid = getUidFromWindowHash();
				if (uid) {
					if (_dates[slider.getCurrentNumber()].uniqueid == uid) {
						return; // prevent self-triggering repeat
					}
					var idx = getVisibleSlideIdxByUid(uid);
					if (idx) {
						goToEvent(idx);
						var ok = true;
					} else if (goToHiddenEvent(uid)) {
						var ok = true;
					}
				}
				if(window.location.hash && !ok) {
					setHash(_dates[slider.getCurrentNumber()].uniqueid);
				}
			}
		}
		
		var getUidFromWindowHash = function() {
			var hash = window.location.hash;
			if (hash && hash.length > 0) {
				return parseInt(hash.substring(1));
			}
		}
		
		var getVisibleSlideIdxByUid = function(uid) {
			for (var i = 0; i < _dates.length; i++) {
				if (_dates[i].uniqueid == uid) {
					return i;
				}
			}
		}
		
		var goToHiddenEvent = function(uid) {
			// skip if already on that event
			if (_dates[slider.getCurrentNumber()].uniqueid == uid) {
				return true;
			}

			// iterate through list of all items
			for (var i = 0; i < data.date.length; i++) {
				if (data.date[i].uniqueId == uid) {
					if (typeof config.onNavigateToHidden == 'function') {
						var filterDelta = {
							hide_completed: VMM.Date.parse(data.date[i].endDate).getTime() > new Date().getTime(),
							provider: data.date[i].provider,
							stream: data.date[i].stream
						};
						config.onNavigateToHidden(filterDelta, uid);
						break;
					}
				}
			}
			return false;
		}
		
		/* CREATE CONFIG
		================================================== */
		var createConfig = function(conf) {
			
			// APPLY SUPPLIED CONFIG TO TIMELINE CONFIG
			if (typeof timeline_config == 'object') {
				trace("HAS TIMELINE CONFIG");
			    var x;
				for (x in timeline_config) {
					if (Object.prototype.hasOwnProperty.call(timeline_config, x)) {
						config[x] = timeline_config[x];
					}
				}
			} else if (typeof conf == 'object') {
				var x;
				for (x in conf) {
					if (Object.prototype.hasOwnProperty.call(conf, x)) {
						config[x] = conf[x];
					}
				}
			}
			
			config.nav.width			=	config.width;
			config.nav.getSlideNumberForToday = getSlideNumberForToday;
			config.feature.width		=	config.width;
			config.feature.height		=	config.height - config.nav.height;
			VMM.Timeline.Config			=	config;
			VMM.master_config.Timeline	=	VMM.Timeline.Config;
			this.events					=	config.events;
		}
		
		/* CREATE TIMELINE STRUCTURE
		================================================== */
		var createStructure = function(w, h) {
			$timeline = 			VMM.getElement(timeline_id);
			
			VMM.Lib.addClass(timeline_id, "vmm-timeline");
			
			$feedback = 			VMM.appendAndGetElement($timeline, "<div>", "feedback", "");
			$messege = 				VMM.appendAndGetElement($feedback, "<div>", "messege", "Timeline");
			slider = 				new VMM.Slider(timeline_id + " div.slider", config);
			timenav = 				new VMM.Timeline.TimeNav(timeline_id + " div.navigation");

			if (!has_width) {
				config.width = VMM.Lib.width($timeline);
			} else {
				VMM.Lib.width($timeline, config.width);
			}

			if (!has_height) {
				config.height = VMM.Lib.height($timeline);
			} else {
				VMM.Lib.height($timeline, config.height);
			}
			
		}
		
		/* ON EVENT
		================================================== */

		function onDataReady(e, d) {
			trace("onDataReady");
			trace(d);
			data = d.timeline;
			
			if (type.of(data.era) == "array") {
				
			} else {
				data.era = [];
			}
			
			buildDates();
			
		};
		
		function onDatesProcessed() {
			build();
		}
		
		function reSize(fast) {
			updateSize();
			slider.setSize(config.feature.width, config.feature.height, fast);
			timenav.setSize(config.width, config.height);
		};
		
		function onSliderLoaded(e) {
			config.loaded.slider = true;
			onComponentLoaded();
		};
		
		function onComponentLoaded(e) {
			config.loaded.percentloaded = config.loaded.percentloaded + 25;
			
			if (config.loaded.slider && config.loaded.timenav) {
				hideMessege();
			}
		}
		
		function onTimeNavLoaded(e) {
			config.loaded.timenav = true;
			onComponentLoaded();
		}
		
		function onSlideUpdate(e) {
			config.current_slide = slider.getCurrentNumber();
			setHash(_dates[config.current_slide].uniqueid);
			timenav.setMarker(config.current_slide, config.ease,config.duration);
		};
		
		function onMarkerUpdate(e) {
			config.current_slide = timenav.getCurrentNumber();
			setHash(_dates[config.current_slide].uniqueid);
			slider.setSlide(config.current_slide);
		};

		function navigateToEvent(e, params) {
			goToEvent(params.id, params.fast);
		};
        
		var goToEvent = function(n, fast) {
			if (n <= _dates.length - 1 && n >= 0) {
				config.current_slide = n;
				slider.setSlide(config.current_slide, fast);
				timenav.setMarker(config.current_slide, config.ease,config.duration, fast);
			} 
		}
		
		function setHash(n) {
			if (config.hash_bookmark) {
				window.location.hash = "#" + n.toString();
			}
		}
		
		/* PUBLIC FUNCTIONS
		================================================== */
		this.init = function(_data, _timeline_id, conf) {
			
			if (type.of(_timeline_id) == "string") {
				if (_timeline_id.match("#")) {
					timeline_id = _timeline_id;
				} else {
					timeline_id = "#" + _timeline_id;
				}
			}
			
			createConfig(conf);
			createStructure(w,h);
			
			trace('TIMELINE INIT');
			VMM.Date.setLanguage(VMM.Timeline.Config.language);
			VMM.master_config.language = VMM.Timeline.Config.language;
			
			$feedback = VMM.appendAndGetElement($timeline, "<div>", "feedback", "");
			$messege = VMM.appendAndGetElement($feedback, "<div>", "messege", VMM.master_config.language.messages.loading_timeline);
			
			VMM.bindEvent(global, onDataReady, config.events.data_ready);
			VMM.bindEvent(global, showMessege, config.events.messege);
            VMM.bindEvent(global, applyFilter, config.events.apply_filter);
			VMM.bindEvent(global, navigateToEvent, config.events.go_to_event);
			
			/* GET DATA
			================================================== */
			
			if (VMM.Browser.browser == "MSIE" && parseInt(VMM.Browser.version, 10) == 7) {
				ie7 = true;
				VMM.fireEvent(global, config.events.messege, "Internet Explorer 7 is not supported by #Timeline.");
			} else {
				if (typeof config.filter != 'undefined') {
					filter = config.filter;
				}
				if (type.of(_data) == "string" || type.of(_data) == "object") {
					VMM.Timeline.DataObj.getData(_data);
				} else {
					VMM.Timeline.DataObj.getData(VMM.getElement(timeline_id));
				}
			}
		};
		
		this.iframeLoaded = function() {
			trace("iframeLoaded");
		};
		
		this.reload = function(_d) {
			trace("loadNewDates" + _d);
			$messege = VMM.appendAndGetElement($feedback, "<div>", "messege", VMM.master_config.language.messages.loading_timeline);
			data = {};
			VMM.Timeline.DataObj.getData(_d);
		};
		
		/* DATA 
		================================================== */
		var getData = function(url) {
			VMM.getJSON(url, function(d) {
				data = VMM.Timeline.DataObj.getData(d);
				VMM.fireEvent(global, config.events.data_ready);
			});
		};
		
        /* FILTERING
         ================================================== */
        function applyFilter(e, _filter) {
			filter = _filter;
			try {
				timenav.setSkipRescale(true);
				buildDates();
			} finally {
				timenav.setSkipRescale(false);
			}	
		};

        var filterMatch = function(filter, entry) {
            if (filter.hide_completed && entry.enddate.getTime() <= new Date().getTime()) {
                return false;
            }
            if (typeof filter.streams != 'undefined' && filter.streams.indexOf(entry.stream) < 0) {
                return false;
            }
            if (typeof filter.providers != 'undefined' && filter.providers.indexOf(entry.provider) < 0) {
                return false;
            }
            return true;
		};
		

		/* MESSEGES 
		================================================== */
		
		var showMessege = function(e, msg) {
			trace("showMessege " + msg);
			VMM.attachElement($messege, msg);
		};
		
		var hideMessege = function() {
			VMM.Lib.animate($feedback, config.duration, config.ease*4, {"opacity": 0}, detachMessege);
		};
		
		var detachMessege = function() {
			VMM.Lib.detach($feedback);
		}

        var getSlideNumberForToday = function() {
            var eventNumber = 0;
            var minDistance = _dates[0].fulldate;
            var tempDistance = 0;
            var dateCurrent = (new Date()).getTime();

            for (var iteratorDates = 0; iteratorDates < _dates.length; iteratorDates++) {
                tempDistance = Math.abs(dateCurrent - _dates[iteratorDates].fulldate);

                if (tempDistance <= minDistance) {
                    minDistance = tempDistance;
                    eventNumber = iteratorDates;
                }
            }

            return eventNumber;
        }

		/* BUILD DISPLAY
		================================================== */
		var build = function() {
			
			// START AT END?
			if (config.start_at_end && config.current_slide == 0) {
				config.current_slide = _dates.length - 1;
			}

            if (config.start_at_current_date && !config.current_slide) {
                config.current_slide = getSlideNumberForToday();
            }

            // CREATE DOM STRUCTURE
			VMM.attachElement($timeline, "");
			VMM.appendElement($timeline, "<div class='container main'><div class='feature'><div class='slider'></div></div><div class='navigation'></div></div>");
			
			VMM.bindEvent("div.slider", onSliderLoaded, "LOADED");
			VMM.bindEvent("div.navigation", onTimeNavLoaded, "LOADED");
			VMM.bindEvent("div.slider", onSlideUpdate, "UPDATE");
			VMM.bindEvent("div.navigation", onMarkerUpdate, "UPDATE");
			
			slider.init(_dates);
			timenav.init(_dates, data.era);
			reSize(true);
			
			// RESIZE EVENT LISTENERS
			VMM.bindEvent(global, reSize, config.events.resize);
			//VMM.bindEvent(global, function(e) {e.preventDefault()}, "touchmove");

			setHash(_dates[slider.getCurrentNumber()].uniqueid);
		};
		
		var updateSize = function() {
			trace("UPDATE SIZE");
			config.width = VMM.Lib.width($timeline);
			config.height = VMM.Lib.height($timeline);
			
			config.nav.width = config.width;
			config.feature.width = config.width;
			
			if (VMM.Browser.device == "mobile") {
				//config.feature.height = config.height;
			} else {
				//config.feature.height = config.height - config.nav.height - 3;
			}
			config.feature.height = config.height - config.nav.height - 3;
		};
		
		// BUILD DATE OBJECTS
		var buildDates = function() {
            if (_dates.length > 0) {
                var _selected = _dates[slider.getCurrentNumber()].uniqueid;
            }
			_dates = [];
			VMM.fireEvent(global, config.events.messege, "Building Dates");
			updateSize();
			
			for(var i = 0; i < data.date.length; i++) {
				
				if (data.date[i].startDate != null && data.date[i].startDate != "") {
					
					var _date = {};
					
					// START DATE
					if (data.date[i].type == "tweets") {
						_date.startdate = VMM.ExternalAPI.twitter.parseTwitterDate(data.date[i].startDate);
					} else {
						_date.startdate = VMM.Date.parse(data.date[i].startDate);
					}
					
					if (!isNaN(_date.startdate)) {
						
					
						// END DATE
						if (data.date[i].endDate != null && data.date[i].endDate != "") {
							if (data.date[i].type == "tweets") {
								_date.enddate = VMM.ExternalAPI.twitter.parseTwitterDate(data.date[i].endDate);
							} else {
								_date.enddate = VMM.Date.parse(data.date[i].endDate);
							}
						} else {
							_date.enddate = _date.startdate;
						}
						
						_date.needs_slug = false;
						
						if (data.date[i].headline == "") {
							if (data.date[i].slug != null && data.date[i].slug != "") {
								_date.needs_slug = true;
							}
						}
					
						_date.title				= data.date[i].headline;
						_date.headline			= data.date[i].headline;
						_date.type				= data.date[i].type;
						_date.date				= VMM.Date.prettyDate(_date.startdate);
						_date.asset				= data.date[i].asset;
						_date.fulldate			= _date.startdate.getTime();
						_date.text				= data.date[i].text;
						_date.content			= "";
						_date.tag				= data.date[i].tag;
						_date.slug				= data.date[i].slug;
						_date.uniqueid			= data.date[i].uniqueId;
                        _date.stream            = data.date[i].stream;
                        _date.provider          = data.date[i].provider;
                        _date.colorIndexId      = data.date[i].colorIndexId;
                        _date.courseId          = data.date[i].uniqueId;
                        _date.instructors       = data.date[i].instructors;

                        if (filterMatch(filter, _date)) {
						    _dates.push(_date);
					    } 
                    }
					
				}
				
			};
			
			/* CUSTOM SORT
			================================================== */
			if (data.type != "storify") {
				_dates.sort(function(a, b){
					return a.fulldate - b.fulldate
				});
			}
			
			/* CREATE START PAGE IF AVAILABLE
			================================================== */
			if (data.headline != null && data.headline != "" && data.text != null && data.text != "") {
				trace("HAS STARTPAGE");
				var _date = {}, td_num = 0, td;
				
				td = _dates.length > 0 ? _dates[0].startdate : VMM.Date.parse(data.startDate);
				_date.startdate = new Date(td);
				
				if (td.getMonth() === 0 && td.getDate() == 1 && td.getHours() === 0 && td.getMinutes() === 0 ) {
					// trace("YEAR ONLY");
					_date.startdate.setFullYear(td.getFullYear() - 1);
				} else if (td.getDate() <= 1 && td.getHours() === 0 && td.getMinutes() === 0) {
					// trace("YEAR MONTH");
					_date.startdate.setMonth(td.getMonth() - 1);
				} else if (td.getHours() === 0 && td.getMinutes() === 0) {
					// trace("YEAR MONTH DAY");
					_date.startdate.setDate(td.getDate() - 1);
				} else  if (td.getMinutes() === 0) {
					// trace("YEAR MONTH DAY HOUR");
					_date.startdate.setHours(td.getHours() - 1);
				} else {
					// trace("YEAR MONTH DAY HOUR MINUTE");
					_date.startdate.setMinutes(td.getMinutes() - 1);
				}
				
				_date.uniqueid		= -1;
				_date.enddate		= _date.startdate;
				_date.title			= data.headline;
				_date.headline		= data.headline;
				_date.text			= data.text;
				_date.type			= "start";
				_date.date			= VMM.Date.prettyDate(data.startDate);
				_date.asset			= data.asset;
				_date.slug			= false;
				_date.needs_slug	= false;
				_date.fulldate		= _date.startdate.getTime();
				
				if (config.embed) {
					VMM.fireEvent(global, config.events.headline, _date.headline);
				}
				
				_dates.unshift(_date);
			}
			
			/* CUSTOM SORT
			================================================== */
			if (data.type != "storify") {
				_dates.sort(function(a, b){
					return a.fulldate - b.fulldate
				});
            }

			if (typeof _selected == 'undefined') {
				// first page load
				var uid = getUidFromWindowHash();
				if (uid) {
					var idx = getVisibleSlideIdxByUid(uid);
					if (idx) {
						config.current_slide = idx;
						var ok = true;
					} else if (goToHiddenEvent(uid)) {
						var ok = true;
					}
				}
				if (!ok) {
					config.current_slide = getSlideNumberForToday();
				}
			} else {
				// filtered page load preserve/set selection
				if (typeof filter.uid != 'undefined') {
					var _selected = filter.uid;
					delete filter.uid;
				}
				var found = 0;
				for (var i = 0; i < _dates.length; i++) {
					if (_dates[i].uniqueid == _selected) {
						found = i;
						break;
					}
				}
				if (found > 0) {
					config.current_slide = found;
				} else {
					config.current_slide = getSlideNumberForToday();
				}
			}
			
			onDatesProcessed();

			if (typeof config.onDataLoad == 'function') {
				config.onDataLoad(_dates);
			}
		}
		
	};

	VMM.Timeline.Config = {};
	
};