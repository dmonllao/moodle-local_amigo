define(['jquery'], function($) {

    var PokeGreetings = function PokeGreetings(config, usertime, userid) {
        this.config = config;
        this.usertime = usertime;
        this.userid = userid;
    };

    PokeGreetings.prototype.config = {};
    PokeGreetings.prototype.usertime = {};
    PokeGreetings.prototype.userid;

    PokeGreetings.prototype.getCallback = function getCallback() {
        return function(focused, counterActive, counterInactive, counterLastInactive, lastState) {

            if (this.usertime.dayweek == 6 || this.usertime.dayweek == 0) {
                return [
                    'greetings',
                    'Chuck says...',
                    'Yo mate, working on weekends? Badass!',
                    null,
                ];
            } else if (this.usertime.hour < 8 || this.usertime.hour > 22) {
                return [
                    'greetings',
                    'Chuck says...',
                    'Wow, you woke up early today. Smash those study targets!',
                    null,
                ];
            } else if (this.usertime.hour < 12) {
                return [
                    'greetings',
                    'Chuck says...',
                    'Good morning amigooo!',
                    null,
                ];
            } else {
                return [
                    'greetings',
                    'Chuck says...',
                    'Good to see you here sexy beast! Have a nice day.',
                ];
            }
        }.bind(this);
    };

    return PokeGreetings;
});

