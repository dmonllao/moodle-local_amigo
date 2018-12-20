define(['jquery'], function($) {

    var PokeReturnStudies = function PokeReturnStudies(config, usertime, userid) {
        this.config = config;
        this.usertime = usertime;
        this.userid = userid;
    };

    PokeReturnStudies.prototype.config = {};
    PokeReturnStudies.prototype.usertime = {};
    PokeReturnStudies.prototype.userid;

    PokeReturnStudies.prototype.getCallback = function getCallback() {
        return function(focused, counterActive, counterInactive, counterLastInactive, lastState) {
            if (counterLastInactive > 3) {
                return [
                    'returnstudies',
                    'Chuck says...',
                    'Hey mate, close the facebook tab and return to your studies.',
                    function() {
                        window.focus();
                    }
                ];
            }
        }.bind(this);
    };

    return PokeReturnStudies;
});

