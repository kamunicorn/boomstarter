
$(function() {
    initComboboxes('.ui-filter', '.ui-filter__control');
    initComboboxes('.ui-sorting', '.ui-sorting__control');

    initCheckboxes();
    initTablist();
    initSubjectsMore();
    
    initSlider('#special-slider');
    initSoundSwitchers();
    initBookmarks();
});

// вкладки с категориями
function initTablist() {
    $('.ui-subjects').on('click', '.ui-subjects__item:not(.has-dropdown) .ui-subjects__btn', function(e) {
        let $target = $(e.target),
            $tab = ($target.hasClass('.ui-subjects__btn')) ? $target : $target.closest('.ui-subjects__btn'),
            $currentTab = $('.ui-subjects__btn.is-active');

        if ($tab && !$tab.hasClass('is-active')) {
            $currentTab.removeClass('is-active');
            $tab.addClass('is-active');

            refreshContent();
        }
    });
}

// кнопки Еще... и Смотреть все категории (на мобилках)
function initSubjectsMore() {
    let $subjectsMoreWrappers = $('.js-subjects-more'),
        $options = $subjectsMoreWrappers.find('.ui-dropdown__item');

    // console.log($subjectsMoreWrappers);
    // console.log($options);

    $subjectsMoreWrappers.each( function(i, elem) {
        let $wrapper = $(elem),
            $dropdown = $wrapper.find('.ui-dropdown');

        $dropdown.on('click', '.ui-dropdown__item', function(e) {
            let $target = $(e.target),
                $option = ( $target.hasClass('ui-dropdown__item') ) ? $target : $target.closest('.ui-dropdown__item');
            
            if ($option) {
                let $activeTab = $('.ui-subjects__btn.is-active'),
                    $firstTab = $('.ui-subjects__item:first-child .ui-subjects__btn'),
                    toReplace = {
                        'id': $firstTab.data('id'),
                        'innerHTML': $firstTab.html()
                    },
                    selected = {
                        'id': $option.data('id'),
                        'innerHTML': $option.html()
                    };
                $activeTab.removeClass('is-active');
                $firstTab.data('id', selected.id);
                $firstTab.html(selected.innerHTML);
                $firstTab.addClass('is-active');

                $options.filter(`[data-id="${selected.id}"]`).data('id', toReplace.id);
                $options.filter(`[data-id="${selected.id}"]`).html(toReplace.innerHTML);
                
                refreshContent();                
            }
        });
    });
}

function initCheckboxes() {
    $('#control-content input:checkbox').change( function() {
        refreshContent();
    });
}

// кнопки Добавить в закладки ()
// ajax
function initBookmarks() {
    $('.js-add-bookmark').each( function(i, elem) {
        let $bookmark = $(elem);

        $bookmark.click(function() {
            let projectId = $bookmark.data('project'),
                // action = ($bookmark.hasClass('is-filled')) ? 'delete' : 'add',
                action = ($bookmark.hasClass('is-filled')) ? 'delete-bookmark' : 'add-bookmark',
                request = {
                    'action': action,
                    'projectId': projectId
                };
            // console.log(request);
            
            // $.ajax('api/manage-bookmark.php', {
            $.ajax('api/add-bookmark.json', {
                method: 'GET',
                data: request,
                success: function(response) {
                    // console.log(response);
                    // let processedProjectId = response.projectId,
                    let processedProject = projectId,
                        // $processedBookmark = $bookmark,
                        $processedBookmark = $(`.js-add-bookmark[data-project="${processedProject}"]`);
                    
                    // console.log($processedBookmark);
                    $processedBookmark.toggleClass('is-filled');
                }
            });

        });
    });
}

// кнопки включения/отключения звука
function initSoundSwitchers() {
    $('.js-switch-sound').each( function(i, elem) {
        let $switcher = $(elem);
        
        $switcher.click(function() {
            let videoElem = $('#' + $switcher.data('video'))[0];
            videoElem.muted = !videoElem.muted;
            $switcher.toggleClass('is-sound-off is-sound-on');
        });
    });
}

// выпадающие списки для сортировки и фильтрации
function initComboboxes(comboboxWrapper, comboboxControl) {
    $(comboboxWrapper).each( function(i, elem) {
        let $combobox = $(elem),
            $control = $combobox.find( comboboxControl ),
            $dropdown = $combobox.find('.ui-dropdown');

        /* $control.click( function() {
            $combobox.toggleClass('is-open');
        }); */

        $dropdown.on('click', '.ui-dropdown__item', function(e) {
            let $target = $(e.target),
                $currentOption = $dropdown.find('.ui-dropdown__item.is-active'),
                $option = ( $target.hasClass('ui-dropdown__item') ) ? $target : $target.closest('.ui-dropdown__item');
            
            if ($option && !$option.hasClass('is-active')) {
                $currentOption.removeClass('is-active');
                $option.addClass('is-active');
                let selected = {
                    'id': $option.data('id'),
                    'innerHTML': $option.html()
                };
                $control.find('.js-selected').html(selected.innerHTML);
                $control.data('selected', selected.id);
                // $combobox.removeClass('is-open');
                
                refreshContent();
                // console.log(selected);
                // console.log($control.data('selected'));
            }
        });
    });
}

// "рендер" контента (рендер на сервере, я просто вставляю)
// ajax
function refreshContent() {
    let formData = _collectData();
    console.log(formData);
    _showPreloader('#js-render-container');

    $.ajax({
        url: 'api/insert-content.html',
        method: 'GET',
        data: formData,
        success: function(response) {
            // console.log(response);
            // setTimeout(function() {
                $('#js-render-container').html(response);

                initSoundSwitchers();
                initBookmarks();
            // }, 1000);
        }
    });
    function _showPreloader(where) {
        $(where).html('<section class="container"><div class="ui-loading"><span class="icon icon-loading"></span></div></section>');
    }
    
    function _collectData() {
        return {
            'subject': $('[data-name="subject"].is-active').data('id'),
            'statusCollecting': $('input:checkbox[name="status-collecting"]')[0].checked,
            'statusFinished': $('input:checkbox[name="status-finished"]')[0].checked,
            'sortBy': $('[data-name="sorting"]').data('selected'),
            'filterByArea': $('[data-name="area"]').data('selected'),
            'filterByOwner': $('[data-name="owner"]').data('selected')
        };
    }
}

// in development
function initSlider(selector) {
    $(selector).each(function(i, elem) {
        let $slider = $(elem),
            $row = $slider.find('.js-translate-row'),
            $items = $row.children(),
            $left = $slider.find('.js-left-slide'),
            $right = $slider.find('.js-right-slide'),
            
            itemsCount = $items.length, // элементов в слайдере
            iShift = 0, // смещение сейчас (сколько итемов смещено)
            opts = _calcOpts($slider);
            
        $left.click(function() {
            if (iShift > 0) {
                iShift -= opts.iShiftUnit;
                iShift = (iShift > 0) ? iShift : 0;
                _shift(iShift);
                $right.removeAttr('disabled');
                if (iShift <= 0) {
                    $left.attr('disabled', 'disabled');
                }
            }
        });

        $right.click(function() {
            if (iShift < opts.iShiftMax) {
                iShift += opts.iShiftUnit;
                iShift = (iShift < opts.iShiftMax) ? iShift : opts.iShiftMax;
                // iShift = (iShift + opts.iShiftUnit < opts.iShiftMax) ? (iShift + opts.iShiftUnit) : opts.iShiftMax;
                _shift(iShift);
                $left.removeAttr('disabled');
                if (iShift >= opts.iShiftMax) {
                    $right.attr('disabled', 'disabled');
                }
            }
        });

        function _calcOpts($slider) {
            let $row = $slider.find('.js-translate-row'),
                $items = $row.children();
            
            let opts = {
                pxGap: parseInt($row.css('column-gap')), // FIXME: to no column-gap
                pxWidthWrapper: $row.parent().width(), // ширина блока, в котором находятся элементы слайдера
                pxWidthRow: $row.outerWidth(),
                pxWidthItem: $items.first().outerWidth(), // ширина элемента слайдера в px
                iShiftUnit: 1 // на сколько слайдов смещать за раз
            };
            opts.pxTranslateUnit = opts.pxWidthItem + opts.pxGap; // минимальная величина translateX для смещения
            // opts.pxWidthRow = opts.pxTranslateUnit * itemsCount - opts.pxGap; // полная ширина блока с слайдами
            opts.pxTranslateMax = opts.pxWidthRow - opts.pxWidthWrapper; // максимальная величина translateX для смещения
            opts.iShiftMax = opts.pxTranslateMax / opts.pxTranslateUnit; // максимальное количество слайдов для смещения
            // console.log(opts);
            return opts;
        }

        function _shift(unit) { // на сколько элементов слайдера сместить
            let pxTranslateNow = unit * opts.pxTranslateUnit;
            if (unit >= opts.iShiftMax || pxTranslateNow >= opts.pxTranslateMax) {
                pxTranslateNow = opts.pxTranslateMax;
            }
            // pxTranslateNow = (pxTranslateNow < opts.pxTranslateMax) ? pxTranslateNow : opts.pxTranslateMax;
            $row.css('transform', `translateX(-${pxTranslateNow}px)`);
        }
    });
}
