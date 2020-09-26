$(function() {
    initSoundSwitchers();
    initBookmarks();
});

function initBookmarks() {
    var $bookmarks = $('.js-add-bookmark');
    
    $bookmarks.each( (i, elem) => {
        let $bookmark = $(elem);

        $bookmark.click(function() {
            let projectId = $bookmark.data('card'),
                action = ($bookmark.hasClass('is-filled')) ? 'delete' : 'add',
                // action = ($bookmark.hasClass('is-filled')) ? 'delete-bookmark' : 'add-bookmark',
                request = {
                    'action': action,
                    'projectId': projectId
                };
            console.log($bookmark);
            console.log(request);

            $.ajax('api/add-bookmark.json', {
                method: "POST",
                data: request,
                success: function(response) {
                    console.log(response);
                    let processedProjectId = response.projectId,
                        // processedProjectId = projectId,
                        $btn = $(`.js-add-bookmark[data-project="${processedProjectId}"]`);
                    
                    console.log($btn);
                    // $btn.toggleClass('is-filled');
                    $bookmark.toggleClass('is-filled');

                }
            });

        });
    });
}

function initSoundSwitchers() {
    var $switchers = $('.js-switch-sound');

    $switchers.each( (i, elem) => {
        let $switcher = $(elem);
        
        $switcher.click(function() {
            let videoElem = $('#' + $switcher.data('video'))[0];
            videoElem.muted = !videoElem.muted;
            $switcher.toggleClass('is-sound-off is-sound-on');
        });
    });
}
