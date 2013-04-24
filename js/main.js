(function($, hackGlobals) {

    var sport = hackGlobals.sport,
        adContainer = $('#hackathon-ad-container'),
        adSlider = $('#hackathon-ad-slider'),
        adTitle = $('#hackathon-ad-title'),
        adPoints = $('#adPoints');

    FanPointBank = function(userSwid, storage) {
        this.userSwid = userSwid;
        this.storage = storage;
    };
    FanPointBank.prototype = {
        getStorageKey: function(key) {
            return "hackathon." + this.userSwid + "." + key;
        },
        getStoredVal: function(key) {
            return this.storage.getItem(this.getStorageKey(key));
        },
        setStoredVal: function(key, val) {
            this.storage.setItem(this.getStorageKey(key), val);
        },

        getPoints: function(campaignId) {
            return parseInt(this.getStoredVal("points."+campaignId), 10) || 0;
        },
        setPoints: function(campaignId, points) {
            this.setStoredVal("points."+campaignId, points);
        },
        addPoint: function(campaignId) {
            var points = this.getPoints(campaignId) + 1;
            this.setStoredVal("points."+campaignId, points);
        }
    };

    function AdCampaign(id, data) {
        this.id = id;
        this.data = data || {};
    }
    AdCampaign.prototype = {
        getId: function() { 
            return this.id;
        },
        getPointsRequired: function() {
            return this.data.points;
        },
        pointsMeetGoal: function(points) {
            return points >= this.getPointsRequired();
		},
		getGraphic: function() {
			return this.data.imageLarge;
		},
		getRewardText: function() {
			return this.data.reward;
		},
        getTitle: function(){
            return this.data.title;
        },
        getInfo: function(){
            return this.data.info;
        }
    };

    function UserAdCampaign(bank, adCampaign) {
        this.bank = bank;
        this.adCampaign = adCampaign;
    }
    UserAdCampaign.prototype = {
        getPoints: function() {
            return this.bank.getPoints(this.adCampaign.getId());
        },
        hasMetGoal: function() {
            return this.adCampaign.pointsMeetGoal(this.getPoints());
        },
        getPointsRequired: function() {
            return this.adCampaign.getPointsRequired();
        },
        addPoint: function() {
            this.bank.addPoint(this.adCampaign.getId());
        },
        setPoints: function(points) {
            this.bank.setPoints(this.adCampaign.getId(), points);
		},
		getGraphic: function() {
			return this.adCampaign.getGraphic();
		},
		getRewardText: function() {
			return this.adCampaign.getRewardText();
		},
        getTitle: function(){
            return this.adCampaign.getTitle();
        },
        getInfo: function(){
            return this.adCampaign.getInfo();
        }
    };

    function AdContainer() {
    }
    AdContainer.prototype = {
		cancelPendingHide: function() {
			if(this.hideTimeout) {
				clearTimeout(this.hideTimeout);
				this.hideTimeout = null;
			}
		},
        renderPlay: function(hText, hImg, info) {
            var link = "<button class='adbutton' onclick='HackathonController.addPoint();return false;'>Click here to capture your Gamecast FanPoint</button>",
                timerSecs = 7,
                timer = "<p class='ad-timercontainer'>Time is running out to capture: <span class='timer'>" + timerSecs + "</span></p>";
            adSlider.html("<div class='hackathon-ad'><img src=" + hImg + ' width=100><p>' + hText +  '</p> ' + link + " <p>" + info + '</p> ' + timer + "</div>");
            // http://keith-wood.name/countdown.html#formats1
            adSlider.find('.timer').countdown({format:"{sn}", compact:true, until: new Date(new Date().getTime() + timerSecs*1000)});
            this.show();
			this.cancelPendingHide();
            this.hideTimeout = setTimeout(function(obj) { obj.hide(); }, timerSecs*1000, this);
        },
		renderGoalMet: function(rewardText) {
            adSlider.html("<div class='hackathon-ad'><img id='hackathon-qsrcode' src='images/qsrcode.png' width='120' /> Congratulations, davidpean, you earned the reward - " + rewardText 
                + "<br><button class='adbutton' onclick='return false;'>Click here to claim</button><br>"
                + "<div>Found <b>2</b> <a href=''>Locations nearby</a></div></div>");
			this.cancelPendingHide();
            this.show();
		},
        show: function() {
            adSlider.slideDown('slow');
            adContainer.addClass("expanded");
        },
        hide: function() {
            adSlider.slideUp('slow');
            adContainer.removeClass("expanded");
        },
        setPoints: function(points) {
            adPoints.html(points);
        },
        setTitle: function( title ){
            adTitle.html( title );
        }

    };

    function AdController(userAdCampaign, plays) {
        this.userAdCampaign = userAdCampaign;
        this.adContainer = new AdContainer();
		this.plays = plays;
    }
    AdController.prototype = {
        
        addPoint: function() {
            this.userAdCampaign.addPoint(); 
			this.adContainer.setPoints(this.userAdCampaign.getPoints());
			if(this.userAdCampaign.hasMetGoal()) {
				this.adContainer.renderGoalMet(this.userAdCampaign.getRewardText());
			}
			else {
				this.adContainer.hide();
			}
        },

        setPoints: function(points) {
			console.log("set points called", points);
            this.userAdCampaign.setPoints(points || 0);
			this.adContainer.setPoints(this.userAdCampaign.getPoints());
			if(this.userAdCampaign.hasMetGoal()) {
				this.adContainer.renderGoalMet(this.userAdCampaign.getRewardText());
			}
        },

        triggerPlay: function() {
			var playText = this.plays.shift();
            this.adContainer.renderPlay(playText, this.userAdCampaign.getGraphic(), this.userAdCampaign.getInfo());
			this.plays.push(playText);
        },

        setTitle: function(){
            this.adContainer.setTitle( this.userAdCampaign.getTitle() );
        },

        collapseAd: function() {
            this.adContainer.hide();
        }

    };


    function init() {
		var adCampaign,
			plays = [],
			userSwid = "abcde",
			bank,
			userAdCampaign;

        if(sport == "nfl") {
            espn.gamecast.controller.showDriveChart();
            adCampaign = new AdCampaign("whitecastle", {
                title: "Sacks brought to you by White Castle",
				points: 5, 
				imageLarge: "http://api.ning.com/files/IZVpEDlfz9OkN*4PI3CTqBZR4QVvCfUjMui18AUwnkkm85RMdvyPgzV3PyZNUMJICo-yEOLmCR32i0hWGuqlVLVyznwiF8Wa/whitecastlelogo.jpg", 
				reward: "50% off a sack of 10"
			
			});
			plays = [
				"Colin Kaepernick sacked by Paul Kruger for a loss of 10 yards to the BALTIMORE 18.", 
				"Joe Flacco sacked by Ray McDonald for a loss of 5 yards to the SANFRNCSCO 42.", 
				"Colin Kaepernick sacked by Paul Kruger for a loss of zero to the BALTIMORE 9.", 
				"Colin Kaepernick sacked by Arthur Jones for a loss of 6 yards to the SANFRNCSCO 40.", 
				"Joe Flacco sacked by Ahmad Brooks for a loss of 8 yards to the BALTIMORE 9."
			];
        }
        else if(sport == "mlb") { 
            espn.gamecast.controller.showFieldFrame();
            adCampaign = new AdCampaign("homedepot", {
                title: "Home Runs brought to you by Home Depot",
				points: 5, 
				imageLarge: "http://www.brandsoftheworld.com/sites/default/files/styles/logo-thumbnail/public/0018/4102/brand.gif", 
				reward: "5% off your order",
                info: "Claim 5 home runs and receive 5% off of your next order"
			});
			plays = [
				"R Cano homered to left (369 feet).", 
				"J Arencibia homered to center (434 feet), A Lind scored.", 
				"T Hafner homered to left (370 feet).", 
				"V Wells homered to left.", 
				"C Rasmus homered to center, A Lind scored."
			];
        }
        else if(sport == "nba") {
            espn.gamecast.mainControls.toggleView($("#main-controls a.game-action").get(0));
            adCampaign = new AdCampaign("dominospizza", {
                title: "Blocks brought to you by Pizza Hut - Get stuffed!",
				points: 5, 
				imageLarge: "http://www.brandsoftheworld.com/sites/default/files/styles/logo-thumbnail/public/0002/2776/brand.gif", 
				reward: "Buy 1 stuffed crust pizza get 1 free",
                info: "Claim 5 blocks and get a coupon for buy 1 pizza get 1 free"
			});
			plays = [
				"Jeff Green blocks Chris Copeland's three point jumper",
				"Kenyon Martin blocks Jason Terry 's 2-foot layup", 
				"Raymond Felton blocks Avery Bradley 's 18-foot jumper", 
				"Kevin Garnett blocks Raymond Felton's layup", 
				"J.R. Smith blocks Avery Bradley 's 7-foot two point shot."
			];
        }

        if(adCampaign) {
            bank = new FanPointBank(userSwid, espn.storage);
            userAdCampaign = new UserAdCampaign(bank, adCampaign);
            window.HackathonController = new AdController(userAdCampaign, plays);
			window.HackathonController.setPoints(userAdCampaign.getPoints());
            window.HackathonController.setTitle(userAdCampaign.getTitle());
        }

    }

    $(document).ready(init);

})(jQuery, ESPN_HACKATHON_GLOBALS || {});
