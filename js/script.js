$(function() {
    initSwitchSoundButton();
});

function initSwitchSoundButton() {
    var $switchers = $('.js-switch-sound');

    $switchers.click(function(e) {
        let $switch = $(e.target),
            $video = $('#' + $switch.data('video'))[0];
        
        $video.muted = !$video.muted;
        $switch.toggleClass('is-sound-off is-sound-on');
    });
}
