(function($, hackGlobals) {

    var sport = hackGlobals.sport;

    $(document).ready(function() {
    //espn.gamecast.subscribe("ready", function() { 
           
        if(sport == "nfl") {
            espn.gamecast.controller.showDriveChart();
        }
        else if(sport == "mlb") { 
            espn.gamecast.controller.showFieldFrame();
        }
        else if(sport == "nba") {
            espn.gamecast.mainControls.toggleView($("#main-controls a.game-action").get(0));
        }

    });

})(jQuery, ESPN_HACKATHON_GLOBALS || {});
