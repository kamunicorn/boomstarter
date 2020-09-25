$(function() {
    initSwitchSoundButton();
});

function initSwitchSoundButton() {
    var $switchers = $('.js-switch-sound');

    $switchers.click(function(e) {
        let $target = $(e.target),
            $switcher = ($target.hasClass('icon')) ? $target.parent() : $target,
            videoElem = $('#' + $switcher.data('video'))[0];
        
        videoElem.muted = !videoElem.muted;
        $switcher.toggleClass('is-sound-off is-sound-on');
    });
}
