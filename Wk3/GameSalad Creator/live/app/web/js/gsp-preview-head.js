/**
 * IMPORTANT: This file must be saved with a UTF-8 BOM.
 *
 * Specify translations below. The locale names must be all lower case.
 * If a locale lacks one of the tokens, the default locale will be used for that token.
 */
(function(global) {
	'use strict';

	var localizationLookups = {

		'en-us': {
			LOADING: '...',
			SCENES_HEADING: 'Scenes',
			STUB_SHOW_BANNER: 'Test Advertisement',
			STUB_LAUNCH_SERVICE: 'Launch Service',
			STUB_OPEN_URL: 'The Open URL behavior has been triggered.',
			STUB_SHOW_MORE_GAMES: 'Show More Games feature would appear here.',
			STUB_PLATFORM_LOGIN: 'Platform Login information would appear here.',
			STUB_PLATFORM_POST_SCORE: 'Platform information would appear here showing that your score has been posted.',
			STUB_PLATFORM_SHOW_LEADERBOARD: 'Platform would display leaderboard information here.',
			STUB_PLATFORM_SHOW_ACHIEVEMENTS: 'Platform would display achievement information here.',
			STUB_PLATFORM_RESET_ACHIEVEMENTS: 'Platform would reset achievement information.',
			STUB_PLATFORM_UPDATE_ACHIEVEMENT: 'Platform would update achievement information.',
			STUB_IAP_PURCHASE_ITEM: 'Information relevant to purchasing an item would appear here. Click one of the three buttons below to simulate each purchasing scenario.',
			STUB_IAP_RESTORE_ITEM: 'In-App Purchase',
			STUB_TWEET_SHEET: 'The Tweet Sheet behavior has been triggered.',
			STUB_BACK_EXIT: 'The app did not respond to the back event. The default device action would be to exit the app. For preview testing purposes, the app will reset.'
		},


		'zh-cn': {
			LOADING: '',
			SCENES_HEADING: '场景'
		},

		defaultLocale: 'en-us'
	};


	/**
	 * @namespace
	 */
	var gsp = global.gsp || {};
	global.gsp = gsp;


	gsp.localizeFromURL = function(rootElement, url) {
		// init the lookup table
		var defaultLookup = localizationLookups[localizationLookups.defaultLocale];
		var lookup = Object.create(defaultLookup);
		var localeMatch = /locale=([-\w]+)/.exec(url);
		if (localeMatch) {
			var locale = localeMatch[1].toLowerCase();
			var localeLookup = localizationLookups[locale];
			for (var key in localeLookup) {
				lookup[key] = localeLookup[key];
			}
		}

		if (typeof rootElement === 'string') {
			rootElement = global.document.getElementById(rootElement);
		}
		if (rootElement) {
			localizeRecursive(lookup, rootElement);
		}
	};


	function localizeRecursive(lookup, element) {
		if (element instanceof HTMLElement) {
			// localize this element
			var token = element.getAttribute('data-localization-token');
			if (token) {
				if (token in lookup) {
					element.textContent = lookup[token];
				}
			}

			// recurse children
			var child = element.firstElementChild;
			while (child) {
				localizeRecursive(lookup, child);
				child = child.nextElementSibling;
			}
		}
	}


	gsp.detectLayout = function(elementId) {
		try {
			var element = document.getElementById(elementId);
			if (/WebView/.test(navigator.userAgent)) {
				element.classList.add('mac-creator');
			}
			else if (/qt/.test(navigator.userAgent.toLowerCase())) {
				element.classList.add('windows-creator');
			}
			else {
				element.classList.remove('creator');
			}
		}
		catch (exception) {
			// ignore
		}
	};


	// resize the render frame immediately if we know the game width and height
	gsp.resizeRenderFrame = function(elementId, inlineOptions) {
		var renderFrame = document.getElementById(elementId);

		// FIXME: Mac Creator's inline options
		if (inlineOptions) {
			if (inlineOptions.WIDTH.indexOf('<') === -1) {
				renderFrame.style.width = inlineOptions.WIDTH + 'px';
			}

			if (inlineOptions.HEIGHT.indexOf('<') === -1) {
				renderFrame.style.height = inlineOptions.HEIGHT + 'px';
			}
		}

		var query = window.location;
		var zoom = 1;
		var matchZoom = /zoom=([.\d]+)/.exec(query);
		var matchWidth = /width=(\d+)/.exec(query);
		var matchHeight = /height=(\d+)/.exec(query);
		if (matchZoom) {
			zoom = parseFloat(matchZoom[1]);
		}
		if (matchWidth) {
			renderFrame.style.width = Math.ceil(zoom * parseInt(matchWidth[1], 10)) + 'px';
		}
		if (matchHeight) {
			renderFrame.style.height = Math.ceil(zoom * parseInt(matchHeight[1], 10)) + 'px';
		}
	};


	// polyfill classList for QtWebKit
	if (Element.prototype.hasOwnProperty("classList")) {
		return;
	}

	var indexOf = [].indexOf,
		slice = [].slice,
		push = [].push,
		splice = [].splice,
		join = [].join;

	function DOMTokenList(el) {
		this._element = el;
		if (el.className != this.classCache) {
			this._classCache = el.className;

			var classes = this._classCache.split(' '),
				i;
			for (i = 0; i < classes.length; i++) {
				push.call(this, classes[i]);
			}
		}
	}

	function setToClassName(el, classes) {
		el.className = classes.join(' ');
	}

	DOMTokenList.prototype = {
		add: function(token) {
			push.call(this, token);
			setToClassName(this._element, slice.call(this, 0));
		},
		contains: function(token) {
			return indexOf.call(this, token) !== -1;
		},
		item: function(index) {
			return this[index] || null;
		},
		remove: function(token) {
			var i = indexOf.call(this, token);
			splice.call(this, i, 1);
			setToClassName(this._element, slice.call(this, 0));
		},
		toString: function() {
			return join.call(this, ' ');
		},
		toggle: function(token) {
			if (indexOf.call(this, token) === -1) {
				this.add(token);
			}
			else {
				this.remove(token);
			}
		}
	};

	window.DOMTokenList = DOMTokenList;

	Object.defineProperty(Element.prototype, 'classList', {
		get: function() {
			return new DOMTokenList(this);
		}
	});

})(window);
