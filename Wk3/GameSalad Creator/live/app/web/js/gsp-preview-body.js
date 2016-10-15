(function(global) {
	'use strict';


	/**
	 * @namespace
	 */
	var gsp = global.gsp || {};


	/**
	 * @namespace
	 */
	gsp.util = {


		/**
		 * Given a class constructor, return the singleton instance or lazy create it on demand.
		 * The class should have a constructor with no arguments.
		 * This relies on a reserved 'lazySingleton' property of the constructor function-object.
		 * @param {Function} constructor
		 */
		lazySingleton: function(constructor) {
			if (!constructor.lazySingleton) {
				constructor.lazySingleton = new constructor();
			}
			return constructor.lazySingleton;
		}
	};


	/**
	 * Namespace with static methods for DOM manipulation.
	 * @namespace
	 */
	gsp.dom = {

		nodes: {
			CANVAS: 'CANVAS',
			IMAGE: 'IMG',
			AUDIO: 'AUDIO'
		},


		/**
		 * @param {HTMLElement|string} elementOrId
		 * @return {HTMLElement}
		 */
		getElement: function(elementOrId) {
			if (typeof elementOrId === 'string') {
				return document.getElementById(elementOrId);
			}
			else {
				return elementOrId;
			}
		},


		/**
		 * @param {HTMLElement} element
		 * @param {number} width
		 * @param {number} height
		 */
		resizeElement: function(element, width, height) {
			element.style.width = width + 'px';
			element.style.height = height + 'px';
		},


		/**
		 * @param {HTMLElement} element
		 * @param {number} left
		 * @param {number} top
		 */
		repositionElement: function(element, left, top) {
			element.style.left = left + 'px';
			element.style.top = top + 'px';
		},


		/**
		 * @param {HTMLElement} element
		 */
		getComputedStyle: function(element) {
			return window.getComputedStyle(element);
		},


		/**
		 * @param {string} nodeName
		 * @return {HTMLElement}
		 */
		create: function(nodeName) {
			return document.createElement(nodeName);
		},


		/**
		 * @return {DocumentFragment}
		 */
		createFragment: function() {
			return document.createDocumentFragment();
		},


		/**
		 * @return {HTMLCanvasElement}
		 */
		createCanvas: function() {
			return gsp.dom.create(gsp.dom.nodes.CANVAS);
		},


		/**
		 * @return {HTMLImageElement}
		 */
		createImage: function() {
			return gsp.dom.create(gsp.dom.nodes.IMAGE);
		},


		/**
		 * @return {HTMLElement}
		 */
		createAudio: function() {
			return gsp.dom.create(gsp.dom.nodes.AUDIO);
		}
	};


	gsp.JXON = {
		tag: function(jxonObject) {
			return jxonObject['_type'];
		},


		content: function(jxonObject) {
			return jxonObject['_text'];
		},


		id: function(jxonObject) {
			return jxonObject['id'];
		},


		children: function(jxonObject) {
			return jxonObject['_children'];
		},


		childrenWithTag: function(jxonObject, tag) {
			var result = [];
			var children = gsp.JXON.children(jxonObject);
			if (children) {
				children.forEach(function(child) {
					if (gsp.JXON.tag(child) === tag) {
						result.push(child);
					}
				});
			}
			return result;
		},


		childWithTag: function(jxonObject, tag) {
			var children = gsp.JXON.childrenWithTag(jxonObject, tag);
			return children.length > 0 ? children[0] : undefined;
		},


		childWithID: function(jxonObject, id) {
			var result = undefined;
			var children = gsp.JXON.children(jxonObject);
			if (children) {
				children.forEach(function(child) {
					if (gsp.JXON.id(child) === id) {
						result = child;
					}
				});
			}
			return result;
		}
	};


	/**
	 *
	 * @constructor
	 */
	gsp.SceneSelector = function() {
		this.game = null;
		this.defaultImagePath = '';
		this.waitCount = 0;
		this.listElement = null;
		this.defaultElement = null;
		this.listFragment = null;
		this.sceneElements = {};
		this.currentSceneKey = null;
		this.promiseLoaded = null;
	};


	gsp.SceneSelector.instance = function() {
		return gsp.util.lazySingleton(this);
	};


	gsp.SceneSelector.onHeadingClick = function(event) {
		gsp.SceneSelector.instance().onHeadingClick(event);
	};


	/**
	 * static event listener
	 * @param {Event} event
	 */
	gsp.SceneSelector.onSceneClick = function(event) {
		gsp.SceneSelector.instance().onSceneClick(event);
	};


	/**
	 * static event listener
	 * @param {Event} event
	 */
	gsp.SceneSelector.onScreenshotLoad = function(event) {
		gsp.SceneSelector.instance().onScreenshotLoad(this, event);
	};


	/**
	 * static event listener
	 * @param {Event} event
	 */
	gsp.SceneSelector.onScreenshotError = function(event) {
		gsp.SceneSelector.instance().onScreenshotError(this, event);
	};


	gsp.SceneSelector.prototype = {

		setEngineContext: function(engineContext) {
			this.game = engineContext;
			this.game.appendDelegate(this);
		},


		setListElement: function(listElement) {
			this.listElement = listElement;
		},


		load: function() {
			if (!this.promiseLoaded) {
				this.promiseLoaded = new gs.Promise();
				var that = this;
				this.game.getMetadataForAllScenes().then(function(scenes) {
					that.populate(scenes);
				});
			}
			return this.promiseLoaded;
		},


		/**
		 * @param {Array} scenes
		 */
		populate: function(scenes) {
			// click listener for header
			var heading = document.getElementById('scenes-heading');
			heading.addEventListener('click', gsp.SceneSelector.onHeadingClick, false);

			// pre-fetch the default image, because we're very likely to use it
			this.defaultElement = this.listElement.firstElementChild;
			this.defaultImagePath = this.defaultElement.firstElementChild.src;

			// build an HTML scene list
			this.listFragment = document.createDocumentFragment();
			var that = this;
			scenes.forEach(function(scene) {
				var key = scene.key;
				var name = scene.name;
				var screenshotPath = scene.screenshot;

				// list item HTML elements
				var listItem = gsp.dom.create('LI');
				listItem.classList.toggle('visible');
				that.sceneElements[key] = listItem;

				// load scene screenshot
				var screenshot = gsp.dom.createImage();
				screenshot.src = screenshotPath;
				screenshot.addEventListener('load', gsp.SceneSelector.onScreenshotLoad, false);
				screenshot.addEventListener('error', gsp.SceneSelector.onScreenshotError, false);
				screenshot.addEventListener('click', gsp.SceneSelector.onSceneClick, false);

				// title with the scene name
				var title = gsp.dom.create('A');
				title.href = '#';
				title.textContent = name;
				title.addEventListener('click', gsp.SceneSelector.onSceneClick, false);

				// append to the DOM
				listItem.appendChild(screenshot);
				listItem.appendChild(title);
				that.listFragment.appendChild(listItem);
				that.waitCount++;
			});
		},


		onHeadingClick: function(event) {
			document.getElementById('scene-selector').classList.toggle('displayNone');
		},


		/**
		 * @param {Event} event
		 */
		onSceneClick: function(event) {
			// iterate through our sceneElements to find which was clicked. this gives us the scene key
			var eventElement = event.target.parentNode;
			var sceneKeys = Object.keys(this.sceneElements);
			var game = this.game;
			for (var i = 0; i < sceneKeys.length; i++) {
				var sceneKey = sceneKeys[i];
				var sceneElement = this.sceneElements[sceneKey];
				if (sceneElement === eventElement) {
					game.changeScene(sceneKey);
					break;
				}
			}
		},


		/**
		 * Implementation of a Delegate method.
		 * @param {string} sceneKey
		 * @param {string} sceneName
		 */
		onCurrentSceneChanged: function(sceneKey, sceneName) {
			// when the current scene changes, we highlight the new scene
			if (this.currentSceneKey) {
				var previousSceneElement = this.sceneElements[this.currentSceneKey];
				if (previousSceneElement) {
					previousSceneElement.classList.toggle('current');
				}
			}
			this.currentSceneKey = sceneKey;
			var currentSceneListItem = this.sceneElements[this.currentSceneKey];
			if (currentSceneListItem) {
				currentSceneListItem.scrollIntoView(false);
				currentSceneListItem.classList.toggle('current');
			}
		},


		/**
		 * @param {HTMLImageElement} image
		 * @param {Event} event
		 */
		onScreenshotLoad: function(image, event) {
			image.removeEventListener('load', gsp.SceneSelector.onScreenshotLoad, false);

			// when all screenshots are done, we display and resolve our promise
			if (--this.waitCount <= 0) {
				this.listElement.replaceChild(this.listFragment, this.defaultElement);
				this.promiseLoaded.resolve();
			}
		},


		/**
		 * @param {HTMLImageElement} image
		 * @param {Event} event
		 */
		onScreenshotError: function(image, event) {
			image.removeEventListener('error', gsp.SceneSelector.onScreenshotError, false);
			image.src = this.defaultImagePath;
		}
	};


	/**
	 *
	 * @constructor
	 */
	gsp.StubManager = function() {
		this.engine = null;

		this.stubBannerTop = document.getElementById('stub-banner-top');
		this.stubBannerBottom = document.getElementById('stub-banner-bottom');

		this.stubDialogOneButton = document.getElementById('stub-dialog-one-button');
		this.stubDialogOneButtonBody = document.getElementById('stub-dialog-one-button-body');
		this.stubDialogOneButtonOK = document.getElementById('stub-dialog-one-button-ok');

		this.stubDialogThreeButton = document.getElementById('stub-dialog-three-button');
		this.stubDialogThreeButtonBody = document.getElementById('stub-dialog-three-button-body');
		this.stubDialogThreeButtonError = document.getElementById('stub-dialog-three-button-error');
		this.stubDialogThreeButtonCancel = document.getElementById('stub-dialog-three-button-cancel');
		this.stubDialogThreeButtonSuccess = document.getElementById('stub-dialog-three-button-success');

		this.stubDialogOneButtonOK.addEventListener('click', gsp.StubManager.onButtonClicked, false);
		this.stubDialogThreeButtonError.addEventListener('click', gsp.StubManager.onButtonClicked, false);
		this.stubDialogThreeButtonCancel.addEventListener('click', gsp.StubManager.onButtonClicked, false);
		this.stubDialogThreeButtonSuccess.addEventListener('click', gsp.StubManager.onButtonClicked, false);
	};


	gsp.StubManager.instance = function() {
		return gsp.util.lazySingleton(this);
	};


	gsp.StubManager.onButtonClicked = function(event) {
		gsp.StubManager.instance().onButtonClicked(this, event);
	};


	gsp.StubManager.prototype = {

		setEngineContext: function(engine) {
			this.engine = engine;
			engine.appendDelegate(this);
		},


		showOverlayLayer: function() {
			this.engine.getRenderContext().viewport.showOverlayLayer();
		},


		hideOverlayLayer: function() {
			this.engine.getRenderContext().viewport.hideOverlayLayer();
		},


		onShowBannerShow: function(position) {
			this.showOverlayLayer();
			if (position === 'top') {
				this.showElement(this.stubBannerTop);
				this.hideElement(this.stubBannerBottom);
			}
			else {
				this.hideElement(this.stubBannerTop);
				this.showElement(this.stubBannerBottom);
			}
		},


		onShowBannerHide: function() {
			this.hideElement(this.stubBannerTop);
			this.hideElement(this.stubBannerBottom);
			this.hideOverlayLayer();
		},


		setLocalizationToken: function(element, token) {
			element.setAttribute('data-localization-token', token);
			gsp.localizeFromURL(element, window.location);
		},


		showElement: function(element) {
			element.style.display = 'block';
		},


		hideElement: function(element) {
			element.style.display = 'none';
		},


		showOneButtonDialog: function(token) {
			this.showOverlayLayer();
			this.setLocalizationToken(this.stubDialogOneButtonBody, token);
			this.showElement(this.stubDialogOneButton);
		},


		showThreeButtonDialog: function(token) {
			this.showOverlayLayer();
			this.setLocalizationToken(this.stubDialogThreeButtonBody, token);
			this.showElement(this.stubDialogThreeButton);
		},


		onButtonClicked: function(button, event) {
			if (button === this.stubDialogOneButtonOK) {
				this.hideElement(this.stubDialogOneButton);
			}
			else {
				this.hideElement(this.stubDialogThreeButton);
			}
			this.hideOverlayLayer();
			gs.clearTouchState();
		},


		onShowMoreGames: function() {
			this.showOneButtonDialog('STUB_SHOW_MORE_GAMES');
		},


		onLaunchService: function(pageIndex) {
			this.showOneButtonDialog('STUB_LAUNCH_SERVICE');
		},


		onGameCenterLogin: function() {
			this.showOneButtonDialog('STUB_PLATFORM_LOGIN');
		},


		onGameCenterPostScore: function() {
			this.showOneButtonDialog('STUB_PLATFORM_POST_SCORE');
		},


		onGameCenterShowLeaderboard: function() {
			this.showOneButtonDialog('STUB_PLATFORM_SHOW_LEADERBOARD');
		},


		onGameCenterShowAchievements: function() {
			this.showOneButtonDialog('STUB_PLATFORM_SHOW_ACHIEVEMENTS');
		},


		onGameCenterResetAchievements: function() {
			this.showOneButtonDialog('STUB_PLATFORM_RESET_ACHIEVEMENTS');
		},


		onGameCenterUpdateAchievement: function() {
			this.showOneButtonDialog('STUB_PLATFORM_UPDATE_ACHIEVEMENT');
		},


		onTweetSheet: function(message) {
			this.showOneButtonDialog('STUB_TWEET_SHEET');
		},


		onBrowserOpen: function(url) {
			this.showOneButtonDialog('STUB_OPEN_URL');
		}
	};


	/**
	 *
	 * @constructor
	 */
	gsp.ConfigManager = function() {
		this.selectZoom = document.getElementById('select-zoom');
		this.selectResolution = document.getElementById('select-resolution');
		this.selectOrientation = document.getElementById('select-orientation');
		this.selectFit = document.getElementById('select-fit');
		this.selectSimulate = document.getElementById('select-simulate');
		this.selectLog = document.getElementById('select-log');

		this.configReset = document.getElementById('config-reset');
		this.configPause = document.getElementById('config-pause');
		this.configPlay = document.getElementById('config-play');

		this.selectZoom.addEventListener('change', gsp.ConfigManager.onSelectChange, false);
		this.selectResolution.addEventListener('change', gsp.ConfigManager.onSelectChange, false);
		this.selectOrientation.addEventListener('change', gsp.ConfigManager.onSelectChange, false);
		this.selectFit.addEventListener('change', gsp.ConfigManager.onSelectChange, false);
		this.selectSimulate.addEventListener('change', gsp.ConfigManager.onSelectChange, false);
		this.selectLog.addEventListener('change', gsp.ConfigManager.onSelectChange, false);

		this.configReset.addEventListener('click', gsp.ConfigManager.onButtonClick, false);
		this.configPause.addEventListener('click', gsp.ConfigManager.onButtonClick, false);
		this.configPlay.addEventListener('click', gsp.ConfigManager.onButtonClick, false);

		this.detectResolution = true;

		var query = window.location;

		var zoom = 1;
		var matchZoom = /zoom=([.\d]+)/.exec(query);
		var matchWidth = /width=(\d+)/.exec(query);
		var matchHeight = /height=(\d+)/.exec(query);
		if (matchZoom) {
			zoom = parseFloat(matchZoom[1]);
			this.setOption(this.selectZoom, zoom.toString());
		}
		if (matchWidth && matchHeight) {
			this.detectResolution = false;
			var width = parseInt(matchWidth[1], 10);
			var height = parseInt(matchHeight[1], 10);
			if (height > width) {
				this.setOption(this.selectOrientation, 'portrait');
				var temp = width;
				width = height;
				height = temp;
			}
			else {
				this.setOption(this.selectOrientation, 'landscape');
			}
			var knownResolution = this.setOption(this.selectResolution, width + 'x' + height);
			if (!knownResolution) {
				var otherResolution = document.createElement('OPTION');
				otherResolution.value = width + 'x' + height;
				otherResolution.textContent = 'other ' + width + 'x' + height;
				this.selectResolution.add(otherResolution);
				this.selectResolution.selectedIndex = this.selectResolution.options.length - 1;
			}
		}

		var matchFit = /viewport-fit=(\w+)/.exec(query);
		if (matchFit) {
			this.setOption(this.selectFit, matchFit[1]);
		}
		else {
			this.removeEmptyFirstOption(this.selectFit);
		}
	};


	gsp.ConfigManager.instance = function() {
		return gsp.util.lazySingleton(this);
	};


	gsp.ConfigManager.onSelectChange = function(event) {
		gsp.ConfigManager.instance().onSelectChange(event);
	};


	gsp.ConfigManager.onButtonClick = function(event) {
		gsp.ConfigManager.instance().onButtonClick(event);
	};


	gsp.ConfigManager.prototype = {

		setEngineContext: function(engine) {
			this.engine = engine;
			engine.appendDelegate(this);
		},


		onGameDimensionsKnown: function(width, height) {
			if (this.detectResolution) {
				if (height > width) {
					this.setOption(this.selectOrientation, 'portrait');
					this.setOption(this.selectResolution, height + 'x' + width);
				}
				else {
					this.setOption(this.selectOrientation, 'landscape');
					this.setOption(this.selectResolution, width + 'x' + height);
				}
			}
		},


		setOption: function(select, value) {
			for (var i = 0; i < select.options.length; i++) {
				if (select.options[i].value === value.toString()) {
					select.selectedIndex = i;
					this.removeEmptyFirstOption(select);
					return true;
				}
			}
			return false;
		},


		getOption: function(select) {
			return select.options[select.selectedIndex].value;
		},


		removeEmptyFirstOption: function(select) {
			if (!select.options[0].value || select.options[0].value === '-') {
				select.remove(0);
			}
		},


		onSelectChange: function(event) {
			var value = event.target.options[event.target.selectedIndex].value;
			if (event.target === this.selectSimulate) {
				if (value === 'back') {
					// hardware back button, as for tizen
					var didChangeRule = gse.postEvent('keyDown', 'back');
					if (!didChangeRule) {
						// if no rule changes, fallback to terminate app
						gsp.StubManager.instance().showOneButtonDialog('STUB_BACK_EXIT');
						this.engine.reset();
					}
					else {
						// after a time, simulate an up event
						setTimeout(function() {
							gse.postEvent('keyUp', 'back');
						}, 100);
					}
				}
				else if (value === 'suspend') {
					gse.suspend();
				}
				else if (value === 'unsuspend') {
					gse.unsuspend();
				}
				else if (value === 'fullscreen') {
					var frame = document.getElementById('gse-player');
					var func = frame.requestFullScreen ||
						frame.webkitRequestFullScreen ||
						frame.mozRequestFullScreen ||
						frame.msRequestFullScreen || null;
					console.log(func);
					gse.pause();
					if (func) {
						try {
							func.call(frame);
							setTimeout(function() {
								gse.relayout();
								gse.unpause();
							}, 1000);
						}
						catch (exception) {
							console.log(exception);
						}
					}
				}
				this.selectSimulate.selectedIndex = 0;
			}
			else if (event.target === this.selectLog) {
				var log = document.getElementById('log-area');
				if (log) {
					if (value === 'on') {
						log.style.visibility = 'visible';
					}
					else {
						log.style.visibility = 'hidden';
					}
				}
			}
			else {
				this.reload();
			}
		},


		onButtonClick: function(event) {
			if (event.target === this.configReset) {
				this.engine.reset();
			}
			else if (event.target === this.configPause) {
				this.engine.pause();
				this.configPause.classList.add('displayNone');
				this.configPlay.classList.remove('displayNone');
			}
			else if (event.target === this.configPlay) {
				this.engine.play();
				this.configPlay.classList.add('displayNone');
				this.configPause.classList.remove('displayNone');
			}
		},


		reload: function() {
			// create new url and redirect
			var url = window.location.pathname;
			var game = /\??([^&#]*)/.exec(window.location.search)[1];
			url += '?' + game;

			var zoom = parseFloat(this.getOption(this.selectZoom));
			var width;
			var height;
			var resolution = this.getOption(this.selectResolution);
			var match = /(\d+)x(\d+)/.exec(resolution);
			if (match) {
				width = parseInt(match[1], 10);
				height = parseInt(match[2], 10);
				if (this.getOption(this.selectOrientation) === 'portrait') {
					var temp = width;
					width = height;
					height = temp;
				}
				url += '&viewport-reference=frame';
				url += '&zoom=' + zoom;
				url += '&width=' + width;
				url += '&height=' + height;
			}
			else {

			}

			url += '&viewport-fit=' + this.getOption(this.selectFit);
			window.location = url;
		},


		onLogAll: function(message) {
			var log = document.getElementById('log-list');
			if (log) {
				var pre = gsp.dom.create('PRE');
				var level = /^\w+/.exec(message)[0];
				if (typeof level === 'string') {
					pre.className = level.toLowerCase();
				}
				pre.textContent = message;
				log.appendChild(pre);
			}
		},


		onLogDebuggingStatement: function(message, entity) {
			var s = 'USER:   (' + entity + ') ' + message;
			this.onLogAll(s);
		}
	};


	/**
	 * The methods on this object will be invoked according to the gs.Delegate contract.
	 */
	gsp.PlayerDelegate = function(engine) {
		this.engine = engine;
		this.isPreloading = true;
		this.isLoading = false;
		this.loadingTimeout = 250;
		this.didShow = true; // initially shown
	};

	gsp.PlayerDelegate.prototype = {

		onLogAll: function(message) {
			// this is "break on error"
			// look up the call stack to the method before the gs.Log call to see the site of the error
			/*if (/^(ERROR|FATAL)/.test(message)) {
			 debugger;
			 }*/
		},


		onCurrentSceneChanged: function(sceneKey, sceneName) {
			// when the scene changes, update the name displayed in the player
			var sceneTitle = document.getElementById('scene-title');
			sceneTitle.textContent = sceneName;
		},


		onLoadingBegin: function() {
			if (this.isPreloading) {
				return;
			}
			this.isLoading = true;
			var that = this;
			setTimeout(function() {
				if (that.isLoading) {
					that.engine.getRenderContext().viewport.showOverlayLayer();
					that.didShow = true;
					var loadingElement = document.getElementById('gse-loading');
					if (loadingElement) {
						loadingElement.classList.remove('gse-hidden');
					}
				}
			}, this.loadingTimeout);
		},


		onLoadingEnd: function() {
			var preloadingElement = document.getElementById('gse-preloading');
			var loadingElement = document.getElementById('gse-loading');
			if (this.isPreloading) {
				if (preloadingElement) {
					preloadingElement.classList.add('gse-hidden');
				}
				else {
					// preloading has finished but we have no animation. act is if we showed so that later we'll tell the engine to hide
					this.didShow = true;
				}
				this.isPreloading = false;
			}
			else {
				if (loadingElement) {
					loadingElement.classList.add('gse-hidden');
				}
			}
			this.isLoading = false;
			if (this.didShow) {
				this.engine.getRenderContext().viewport.hideOverlayLayer();
				this.didShow = false;
			}
		}
	};


	gse.ready(function(engine) {
		// global player object
		engine.appendDelegate(new gsp.PlayerDelegate(engine));
		global.player = engine;

		// default game path for Windows Creator
		engine.options.defaultPath = 'Test';
		engine.options.viewportReference = 'game';

		// FIXME: Mac Creator's old style of config
		var inlineOptions = global.inlineOptions;
		if (inlineOptions) {
			if (inlineOptions.GAME_URL.indexOf('<') === -1) {
				engine.options.defaultPath = inlineOptions.GAME_URL;
			}
		}

		// setup engine and play
		engine.loadOptionsFromURL();
		engine.setRenderFrame('gse-player');
		engine.play();

		// connect stub manager
		gsp.StubManager.instance().setEngineContext(engine);

		// connect scene selector
		var sceneSelector = gsp.SceneSelector.instance();
		sceneSelector.setListElement(document.getElementById('scene-selector-list'));
		sceneSelector.setEngineContext(engine);
		sceneSelector.load();


		// init config settings
		gsp.ConfigManager.instance().setEngineContext(engine);
	});

})(window);
