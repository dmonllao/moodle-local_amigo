define(['jquery'], function($) {

    var PokeReturnStudies = function PokeReturnStudies(config, timeInfo, user) {
        this.config = config;
        this.timeInfo = timeInfo;
        this.user = user;
    };

    PokeReturnStudies.prototype.config = {};
    PokeReturnStudies.prototype.timeInfo = {};
    PokeReturnStudies.prototype.user;

    PokeReturnStudies.prototype.getCallback = function getCallback() {
        return function(currentView, focused, lastState) {
            if (currentView.counterLastInactive > 3) {
                return [
                    'Chuck says...',
                    'Hey mate, close the facebook tab and return to your studies.',
                    'returnstudies',
                    function() {
                        window.focus();
                    }
                ];
            }
            return false;
        }.bind(this);
    };

    return PokeReturnStudies;
});

