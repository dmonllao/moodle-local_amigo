define(['jquery'], function($) {

    return {
        mainRegionWordCount: function() {
            var main = $('#region-main div[role="main"]').clone();

            // Get rid of media stuff.
            main.find('.mediaplugin').remove();

            // TODO Mathjax and other stuff likely to cause pain. It could
            // be impossible to discard everything...

            // Using replace instead of just text() so we can replace tags by whitespaces.
            // Also multi-space to single space and [.,;] to space
            var text = main.html()
                .replace(/<\/?[^>]+(>|$)/g, ' ')
                .replace(/\s\s+/g, ' ')
                .replace(/(?:\r\n|\r|\n|,|;|\.)/ig, ' ')

            return text.split(' ').length;
        },
    };
});

