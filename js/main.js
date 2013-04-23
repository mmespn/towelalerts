(function($, hackGlobals) {

    var sport = hackGlobals.sport;

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
        },
        getHTML: function() {
            return "<div class='hackathon-ad'>You have " + this.getPoints() + " of " + this.getPointsRequired() + " points</div>";
        },
        render: function(containerNode) {
            $(containerNode).html(this.getHTML());   
        }

    };

    function HackathonController(userAdCampaign) {
        this.userAdCampaign = userAdCampaign;
    }
    HackathonController.prototype = {
        
        renderAd: function() {
            this.userAdCampaign.render($("#hackathon-ad-container"));
        },

        addPoint: function() {
            this.userAdCampaign.addPoint(); 
            this.renderAd();
        },

        setPoints: function(points) {
            this.userAdCampaign.setPoints(points || 0);
            this.renderAd();
        }

    };


    function init() {
        var adCampaign;
        if(sport == "nfl") {
            espn.gamecast.controller.showDriveChart();
            adCampaign = new AdCampaign("whitecastle", {points: 5,plays:["T.Romo sacked at DAL 19 for -8 yards (R.Bernard).", "E.Manning sacked at NYG 44 for -15 yards (D.Ware).", "(Shotgun) E.Manning sacked at NYG 24 for -6 yards (D.Ware).", "(Shotgun) T.Romo sacked at NYG 15 for -9 yards (L.Joseph).", "(Shotgun) E.Manning sacked at NYG 39 for -5 yards (J.Hatcher)."]});
        }
        else if(sport == "mlb") { 
            espn.gamecast.controller.showFieldFrame();
            adCampaign = new AdCampaign("homedepot", {points: 5, plays:["R Cano homered to left (369 feet).", "J Arencibia homered to center (434 feet), A Lind scored.", "T Hafner homered to left (370 feet).", "V Wells homered to left.", "C Rasmus homered to center, A Lind scored."]});
        }
        else if(sport == "nba") {
            espn.gamecast.mainControls.toggleView($("#main-controls a.game-action").get(0));
            adCampaign = new AdCampaign("dominospizza", {points: 5, plays:["Jeff Green blocks Chris Copeland's three point jumper","Kenyon Martin blocks Jason Terry 's 2-foot layup", "Raymond Felton blocks Avery Bradley 's 18-foot jumper", "Kevin Garnett blocks Raymond Felton's layup", "J.R. Smith blocks Avery Bradley 's 7-foot two point shot."]});
        }

        if(adCampaign) {
            var userSwid = "abcde";
            var bank = new FanPointBank(userSwid, espn.storage);
            var userAdCampaign = new UserAdCampaign(bank, adCampaign);
            window.HackathonController = new HackathonController(userAdCampaign);
            window.HackathonController.renderAd();
        }

    }
    $(document).ready(init);
    //espn.gamecast.subscribe("ready", init);
           

})(jQuery, ESPN_HACKATHON_GLOBALS || {});
