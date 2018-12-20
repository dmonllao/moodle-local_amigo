define(['jquery'], function($) {

    var PokeRest = function PokeRest(config, usertime, userid) {
        this.config = config;
        this.usertime = usertime;
        this.userid = userid;
    };

    PokeRest.prototype.config = {};
    PokeRest.prototype.usertime = {};
    PokeRest.prototype.userid;

    PokeRest.prototype.getCallback = function getCallback() {
        return function(focused, counterActive, counterInactive, counterLastInactive, lastState) {
            return [
                'rest',
                'Chuck says...',
                'Maaaateee, rest a bit come on',
                null,
            ];
        }.bind(this);
    }

    return PokeRest;
});

