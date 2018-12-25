define(['jquery'], function($) {

    var PokeGreetings = function PokeGreetings(config, timeInfo, user) {
        this.config = config;
        this.timeInfo = timeInfo;
        this.user = user;
    };

    PokeGreetings.prototype.config = {};
    PokeGreetings.prototype.timeInfo = {};
    PokeGreetings.prototype.user = {};

    PokeGreetings.prototype.getCallback = function getCallback() {
        return function(currentView, focused, lastState) {

            if (this.timeInfo.dayweek == 6 || this.timeInfo.dayweek == 0) {
                return [
                    'Chuck says...',
                    'Yo mate, working on weekends? You are a legend.',
                    null,
                    'greetings',
                ];
            } else if (this.timeInfo.hour < 8) {
                // Before 8am.
                return [
                    'Chuck says...',
                    'Wow, you woke up early today. Smash those study targets!',
                    null,
                    'greetings',
                ];
            } else if (this.timeInfo.hour > 21) {
                return [
                    'Chuck says...',
                    'Good time for studying! Sleeping directly after learning something ' +
                        'new is beneficial for memory. More info in ' +
                        'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0033079',
                    'greetings',
                    null,
                ];
            } else if (this.timeInfo.hour < 12) {
                return [
                    'Chuck says...',
                    'Good morning amigooo!',
                    'greetings',
                    null,
                ];
            } else {
                return [
                    'Chuck says...',
                    'Good to see you here sexy beast! Have a nice day.',
                    'greetings',
                    null,
                ];
            }
        }.bind(this);
    };

    return PokeGreetings;
});

