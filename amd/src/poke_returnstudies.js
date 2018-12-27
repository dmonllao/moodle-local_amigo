define(['jquery'], function($) {

    // TODO Set up a realistic time.
    var POKE_AFTER = 3;

    var PokeReturnStudies = function PokeReturnStudies(config, timeInfo, user, site) {
        this.config = config;
        this.timeInfo = timeInfo;
        this.user = user;
        this.site = site;
    };

    PokeReturnStudies.prototype.config = {};
    PokeReturnStudies.prototype.timeInfo = {};
    PokeReturnStudies.prototype.user = {};
    PokeReturnStudies.prototype.site = {};

    PokeReturnStudies.prototype.getCallback = function getCallback() {
        return function(currentView, isActive, isIdle) {
            if (!isActive && currentView.counterLastInactive > POKE_AFTER) {
                return [
                    'Hey amigo',
                    'You abandoned ' + this.site.fullname + ' halfway through an activity, ' +
                        'come on mate, return to your studies!',
                    'returnstudies',
                    function() {
                        window.focus();
                    }
                ];
            }
            return false;
        }.bind(this);
    };


    PokeReturnStudies.prototype.getTargetPages = function getTargetPages() {
        // Pity that mod_lesson does not have a specific id for an attempt.
        return ['page-mod-quiz-attempt', 'page-mod-lesson-view'];
    };

    return PokeReturnStudies;
});

