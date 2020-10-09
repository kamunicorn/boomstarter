
$(function() {
    initComboboxes();
    initCheckboxes();
    initTablist();
    initSubjectsMore();
    
    initSlider({steps: 'max'});
        // steps: 1 // сколько слайдов прокручивать за раз
        // steps: 'max' // максимальное количество слайдов (сколько влезает в контейнер, столько и прокручивать)
    
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

// при клике по чекбоксам перезагружать контент
function initCheckboxes() {
    $('#control-content input:checkbox').change( function() {
        refreshContent();
    });
}

// кнопки Добавить в закладки
// ajax
function initBookmarks() {
    $('.js-add-bookmark').each( function() {
        let $bookmark = $(this);

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
function initComboboxes() {
    $('.js-combobox').each( function() {
        let $combobox = $(this),
            $control = $combobox.find('.js-combobox-control'),
            $dropdown = $combobox.find('.ui-dropdown');

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
                
                refreshContent();
            }
        });
    });
}

// "рендер" контента (рендер на сервере, я просто вставляю)
// ajax
function refreshContent() {
    let formData = _collectData();
    // console.log(formData);
    _showPreloader('#js-render-container');

    $.ajax({
        url: 'api/insert-content.html',
        method: 'GET',
        data: formData,
        success: function(response) {
            $('#js-render-container').html(response);
            initSoundSwitchers();
            initBookmarks();
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

// слайдер
function initSlider(opts) {
    // step - сколько блоков прокручивать за раз, 
    $('.js-slider').each(function() {
        let $slider = $(this),
            $row = $slider.find('.js-translate-row'),
            $left = $slider.find('.js-left-slide'),
            $right = $slider.find('.js-right-slide'),

            iShift = 0, // смещение сейчас (сколько итемов смещено)
            params = _calcParams($slider, opts.steps);
            
        $left.click(function() {
            if (iShift > 0) {
                iShift -= params.iShiftStep;
                iShift = (iShift > 0) ? iShift : 0;
                _shift($row, iShift, params);
                $right.removeAttr('disabled');
                if (iShift <= 0) { // конец слайдера слева
                    $left.attr('disabled', 'disabled');
                }
            }
        });

        $right.click(function() {
            if (iShift < params.iShiftMax) {
                iShift += params.iShiftStep;
                iShift = (iShift < params.iShiftMax) ? iShift : params.iShiftMax;
                _shift($row, iShift, params);
                $left.removeAttr('disabled');
                if (iShift >= params.iShiftMax) { // конец слайдера справа
                    $right.attr('disabled', 'disabled');
                }
            }
        });
        
        $(window).resize(function() {
            params = _calcParams($slider, opts.steps);
        });
    });

    // параметры трансляции в px и единицах
    function _calcParams($slider, steps) {
        let $row = $slider.find('.js-translate-row'),
            $items = $row.children();
        
        let params = {
            pxWidthWrapper: $row.closest('.js-slider').width(), // ширина зоны просмотра, в которой находятся элементы слайдера
            pxWidthItem: $items.first().outerWidth() // ширина элемента слайдера в px
        };
        params.pxGap = parseInt($row.css('column-gap'));
        params.pxGap = ( isNaN(params.pxGap) ) ? 0 : params.pxGap;
        params.pxTranslateStep = params.pxWidthItem + params.pxGap; // минимальная величина translateX для смещения
        params.pxWidthRow = params.pxTranslateStep * $items.length - params.pxGap; // ширина всей строки со слайдами, без padding
        params.pxTranslateMax = params.pxWidthRow - params.pxWidthWrapper; // максимальная величина translateX для смещения

        params.iShiftStep = 1; // на сколько слайдов смещать за раз
        if (steps == 'max') {  // сколько слайдов влезает в окно просмотре, столько и мотать
            params.iShiftStep = Math.floor ( (params.pxWidthWrapper + params.pxGap) / params.pxTranslateStep );
        }
        params.iShiftMax = Math.ceil(params.pxTranslateMax / params.pxTranslateStep); // максимальное количество слайдов для смещения
        console.log(params);
        return params;
    }
    // сдвиг с помощью translate строки $row со слайдами
    function _shift($row, iShift, params) { // iShift - на сколько элементов слайдера сместить
        let pxTranslateNow = iShift * params.pxTranslateStep;
        if (iShift >= params.iShiftMax || pxTranslateNow >= params.pxTranslateMax) {
            pxTranslateNow = params.pxTranslateMax;
        }
        $row.css('transform', `translateX(-${pxTranslateNow}px)`);
    }
}
