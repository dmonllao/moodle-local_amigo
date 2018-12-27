define(['jquery'], function($) {

    var PokeGreetings = function PokeGreetings(config, timeInfo, user, site) {
        this.config = config;
        this.timeInfo = timeInfo;
        this.user = user;
        this.site = site;
    };

    PokeGreetings.prototype.config = {};
    PokeGreetings.prototype.timeInfo = {};
    PokeGreetings.prototype.user = {};
    PokeGreetings.prototype.site = {};

    PokeGreetings.prototype.getCallback = function getCallback() {
        // http://www.rocketmemory.com/articles/memory-improvement/
        return function(currentView, isActive, isIdle) {

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
                    'Good morning amigo',
                    'Wow, you woke up early today. Smash those study targets!',
                    null,
                    'greetings',
                ];
            } else if (this.timeInfo.hour > 21) {
                // https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0033079
                return [
                    'Chuck says...',
                    'Good time for studying! Sleeping directly after learning something ' +
                        'new is beneficial for memory.',
                    'greetings',
                    null,
                ];
            } else if (this.timeInfo.hour < 12) {
                return [
                    'Good morning amigo',
                    'This is the best time of the day for test-review, problem-solving, report-writing, and math-oriented work.',
                    'greetings',
                    null,
                ];
            } else {
                return [
                    'Good to see you here sexy beast',
                    'Did you know that the afternoon is the best time of day for reading-heavy tasks?',
                    'greetings',
                    null,
                ];
            }
        }.bind(this);
    };

    return PokeGreetings;
});

