/**
 * Confi-fi Radio Paris
 * Started from: https://github.com/vajayattila/RockBoxRadioPlayer
 * Curated & Hosted by @Jaraimie
 * Improved & coded by @rsepierre
 */

var confiPlayer = {
	urlBase: "http://radioconfifi.zapto.org:8081",
	sourceIndex: 0,
	urlParams: "/live",
	refreshRate: 4000,
	maxSongTitleLength: 60,
	forceSongShowTitle: false,
	audioEl: null,
	xmlhttp: null,
	serverInfo: null,
	infoDiv: null,
	statusDiv: null,
	volumeDiv: null,
	volumeState: null,
	refreshStatus: null,
	playButton: null,
	stopButton: null,
	pauseInterval: null,
	forceDecodeUtf8: false,
	forceUnicodeEncoding: function (str) {
		if (this.forceDecodeUtf8 == true) {
			str = this.decodeURIComponent(escape(str));
		}
		return str;
	},
	setSongTitle: function (title) {
		this.statusDiv.classList.add('hidden');
		this.infoDiv.classList.remove('hidden');
		this.infoDiv.innerHTML = this.forceUnicodeEncoding(title);
	},
	setStatusText: function (title) {
		this.statusDiv.classList.remove('hidden');
		this.infoDiv.classList.add('hidden');
		this.statusDiv.innerHTML = title;
	},
	playRock: function () {
		this.audioEl.load();
		this.audioEl.play();
	},
	pauseRock: function () {
		this.audioEl.pause();
	},
	setPausedTimer: function () {
		if (this.audioEl.paused) {
			if (this.pauseInterval == null) {
				this.pauseInterval = setInterval(function () {
					if (this.audioEl.paused) {
						this.setStatusText("Stopped");
					}
					clearInterval(this.pauseInterval);
					this.pauseInterval = null;
				}, this.refreshRate);
			}
		}
	},
	setVolumeButtons: function () {
		var volUp = document.getElementById("volUp");
		var volDown = document.getElementById("volDown");
		if (volUp != null) {
			volUp.disabled = this.audioEl.volume == 1;
		}
		if (volDown != null) {
			volDown.disabled = this.audioEl.volume == 0;
		}
	},
	volUp: function () {
		if (this.audioEl.volume < 1) {
			this.setPausedTimer();
			this.audioEl.volume = Math.round((this.audioEl.volume + 0.1) * 10) / 10;
		}
	},
	volDown: function () {
		if (0 < this.audioEl.volume) {
			this.setPausedTimer();
			this.audioEl.volume = Math.round((this.audioEl.volume - 0.1) * 10) / 10;
		}
	},
	volSet: function (value) {
		if (value >= 0 && value <= 1) {
			this.setPausedTimer();
			this.audioEl.volume = value;
		}
	},
	volUpdate: function () {
		var volume = this.audioEl.volume * 100;
		this.volumeState.style.top = 100 - volume + '%';
		this.setStatusText("Volume: " + this.audioEl.volume * 100 + "%");
		this.setVolumeButtons();
	},
	volHoverHandle: function (e) {
		// Set MouseY
		e = e || window.event;
		var mouseY = e.pageY;
		if (mouseY === undefined) {
			mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		// Start function
		var origin = confiPlayer.volumeDiv.offsetTop - document.documentElement.scrollTop;
		var height = confiPlayer.volumeDiv.offsetHeight;
		var value = height - (mouseY - origin);
		confiPlayer.hoverVolume = (Math.round((value / height) * 10) / 10);
		confiPlayer.volumeState.style.top = 100 - Math.round((value / height) * 100) + '%';
	},
	setup: function () {
		this.audioEl = document.getElementById("audio");
		this.playButton = document.getElementById("playButton");
		this.stopButton = document.getElementById("stopButton");
		this.xmlhttp = new XMLHttpRequest();
		this.serverInfo = null;
		this.infoDiv = document.getElementById("infoDiv");
		this.statusDiv = document.getElementById("status");
		this.volumeDiv = document.getElementById("volumeDiv");
		this.volumeState = document.getElementById("volumeState");
		this.statusDiv.classList.add('hidden');
		this.refreshStatus = setInterval(function () {
			if ((!confiPlayer.audioEl.paused && confiPlayer.pauseInterval == null) || confiPlayer.forceSongShowTitle === true) {
				confiPlayer.xmlhttp.open("GET", confiPlayer.urlBase.concat("/", "status-json.xsl"), true);
				confiPlayer.xmlhttp.send();
			}
		}, confiPlayer.refreshRate);
		this.xmlhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				confiPlayer.serverInfo = JSON.parse(this.responseText);
				if (Array.isArray(confiPlayer.serverInfo.icestats.source)) {
					confiPlayer.setSongTitle(confiPlayer.serverInfo.icestats.source[confiPlayer.sourceIndex].title);
				} else {
					confiPlayer.setSongTitle(confiPlayer.serverInfo.icestats.source.title);
				}
			}
		};
		this.audioEl.oncanplay = function () {
			playButton.disabled = false;
			stopButton.disabled = true;
			if (confiPlayer.audioEl.paused) {
				confiPlayer.setSongTitle('On Air.');
			}
		};
		this.audioEl.onplaying = function () {
			playButton.disabled = true;
			stopButton.disabled = false;
		};
		this.audioEl.onpause = function () {
			playButton.disabled = false;
			stopButton.disabled = true;
			confiPlayer.setStatusText('Stopped');
		};
		this.audioEl.onloadstart = function () {
			playButton.disabled = false;
			stopButton.disabled = true;
			confiPlayer.setStatusText('Loading...');
		};
		this.audioEl.onvolumechange = function () {
			confiPlayer.volUpdate();
		};
		this.audioEl.src = this.urlBase.concat(this.urlParams);
		this.audioEl.type = 'audio/mpeg';
		this.setVolumeButtons();
		this.volUpdate();
		this.volumeDiv.addEventListener('mouseenter', function () {
			document.addEventListener('mousemove', confiPlayer.volHoverHandle);
		});
		this.volumeDiv.addEventListener('mouseleave', function () {
			document.removeEventListener('mousemove', confiPlayer.volHoverHandle);
			confiPlayer.volUpdate();
		});
		this.volumeDiv.addEventListener('click', function () {
			confiPlayer.volSet(confiPlayer.hoverVolume);
		});
	},
}
