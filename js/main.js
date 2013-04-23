(function($, hackGlobals) {

    var sport = hackGlobals.sport,
        adContainer = $('#hackathon-ad-container'),
        adSlider = $('#hackathon-ad-slider'),
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
            return this.getStoredVal("points."+campaignId) || 0;
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
            this.bank.setPoints(this.adCampaign.getId());
        }
    };

    function AdContainer() {
    }
    AdContainer.prototype = {
        renderPlay: function(hText, hImg) {
            var link = "<button onclick='HackathonController.addPoint();return false;'>Get points</button>";

            adSlider.html("<div class='hackathon-ad'>" + hText +  ' ' + link + "</div>");
            this.show();
        },
        show: function() {
            adSlider.slideDown('slow');
        },
        hide: function() {
            adSlider.slideUp('slow');
        },
        setPoints: function(points) {
            adPoints.html(points);
        }

    };

    function AdController(userAdCampaign) {
        this.userAdCampaign = userAdCampaign;
        this.adContainer = new AdContainer();
    }
    AdController.prototype = {
        
        renderAd: function() {
            this.adContainer.setPoints(this.userAdCampaign.getPoints());
            this.adContainer.hide();
        },

        addPoint: function() {
            this.userAdCampaign.addPoint(); 
            this.renderAd();
        },

        setPoints: function(points) {
            this.userAdCampaign.setPoints(points || 0);
            this.renderAd();
        },
        triggerPlay: function() {
            this.adContainer.renderPlay('Home run', 'http://www.barewalls.com/i/c/594102_Home-Run.jpg');
        }

    };


    function init() {
        var adCampaign;
        if(sport == "nfl") {
            espn.gamecast.controller.showDriveChart();
            adCampaign = new AdCampaign("whitecastle", 
                    {
                        points: 5, 
                        imageLarge: "http://api.ning.com/files/IZVpEDlfz9OkN*4PI3CTqBZR4QVvCfUjMui18AUwnkkm85RMdvyPgzV3PyZNUMJICo-yEOLmCR32i0hWGuqlVLVyznwiF8Wa/whitecastlelogo.jpg", 
                        plays:["Colin Kaepernick sacked by Paul Kruger for a loss of 10 yards to the BALTIMORE 18.", "Joe Flacco sacked by Ray McDonald for a loss of 5 yards to the SANFRNCSCO 42.", "Colin Kaepernick sacked by Paul Kruger for a loss of zero to the BALTIMORE 9.", "Colin Kaepernick sacked by Arthur Jones for a loss of 6 yards to the SANFRNCSCO 40.", "Joe Flacco sacked by Ahmad Brooks for a loss of 8 yards to the BALTIMORE 9."],
                        reward: "50% off a sack of 10"
                    
                    }
            );
        }
        else if(sport == "mlb") { 
            espn.gamecast.controller.showFieldFrame();
            adCampaign = new AdCampaign("homedepot", 
                    {
                        points: 5, 
                        imageLarge: "http://www.brandsoftheworld.com/sites/default/files/styles/logo-thumbnail/public/0018/4102/brand.gif", 
                        plays:["R Cano homered to left (369 feet).", "J Arencibia homered to center (434 feet), A Lind scored.", "T Hafner homered to left (370 feet).", "V Wells homered to left.", "C Rasmus homered to center, A Lind scored."],
                        reward: "5% off your order"
                    }
            );
        }
        else if(sport == "nba") {
            espn.gamecast.mainControls.toggleView($("#main-controls a.game-action").get(0));
            adCampaign = new AdCampaign("dominospizza", 
                    {
                        points: 5, 
                        imageLarge: "http://www.contactcenterworld.com/images/company/dominos-pizza-largex3-logo.jpg", 
                        plays:["Jeff Green blocks Chris Copeland's three point jumper","Kenyon Martin blocks Jason Terry 's 2-foot layup", "Raymond Felton blocks Avery Bradley 's 18-foot jumper", "Kevin Garnett blocks Raymond Felton's layup", "J.R. Smith blocks Avery Bradley 's 7-foot two point shot."],
                        reward: "Buy 1 stuffed crust pizza get 1 free"
                    }
            );
        }

        if(adCampaign) {
            var userSwid = "abcde";
            var bank = new FanPointBank(userSwid, espn.storage);
            var userAdCampaign = new UserAdCampaign(bank, adCampaign);
            window.HackathonController = new AdController(userAdCampaign);
            window.HackathonController.renderAd();
        }

    }

    $(document).ready(init);

})(jQuery, ESPN_HACKATHON_GLOBALS || {});
