$(function(){

    'use strict';

    var $html = $('html'),
        $body = $('body'),
        $masonryGrid = $('.masonry'),
        $window = $(window),
        $content = $body.find('.content'),
        $topNav = $('<a href="#" id="to-top" class="anchor-link"><hr/><hr/></a>'),
        headerHeight = $body.find('header.header').height(),
        $anchorLink = $body.find('.anchor-link'),
        $anchorSection = $body.find('.anchor-section');

    $body.append($topNav);

    $('.burger').on('click touch', function(){
        $body.toggleClass('menu-opened');
    });

    $('.menu-link').on('click touch', function(){
        $body.removeClass('menu-opened');
    });
    // The Masonry Grid

    // Used for ID's so multiple grids don't interfere by filtering
    var gridCount = 0;

    // Loop through grids
    $masonryGrid.each(function(){

        var grid = $(this);

        // Set the isotope
        grid.isotope({
            itemSelector: '.grid-item',
            columnWidth: '.grid-sizer'
        });

    });
    

    // Add filter functionality
    $body.on('click touch', '.grid-filters .filter', function(e){

        e.preventDefault();
        e.stopImmediatePropagation();

        var el = $(this);
        var filters = el.attr('data-filter');
        var targetGrid = el.parents('.grid-filters').attr('data-target');
        var offset = el.offset().top;

        el.addClass('active').parent().siblings().find('.filter').removeClass('active');

        $masonryGrid.filter('#'+targetGrid).isotope({
            filter : filters
        });

        TweenMax.to('html,body', 1.5, { scrollTo : { y : offset, autoKill : false }, ease: Quint.easeInOut, onComplete : function(){ 
            
            var scrollmem = $window.scrollTop(); // Fix for scrolling to anchor issue
            $window.scrollTop(scrollmem);
            $body.removeClass('scrolled-up');

        }});

    });

    // Lets make filters mobile-friendly
    $body.on('click touch', '.grid-filters', function(e){
        $(this).toggleClass('open');
    });

    $masonryGrid.on( 'arrangeComplete', animateItems );

    $html.find('header.header .has-dropdown').on('mouseover', function(){
        $body.addClass('dropdown-hovered');
        $(this).addClass('hover');
    }).on('mouseout', function(){
        $body.removeClass('dropdown-hovered');
        $(this).removeClass('hover');
    });

    $body.on('click touch', '.anchor-link', function(e){

        e.preventDefault();
        e.stopImmediatePropagation();

        var anchor = $(this).attr('href');
        var offset = 0;

        $content.removeClass('faded');

        if (anchor == '#')
            offset = 0;
        else
            offset = $(anchor).offset().top;

        TweenMax.to(window, 1.5, { scrollTo : { y : offset, autoKill : false }, ease: Quint.easeInOut, onComplete : function(){ 
            
            var scrollmem = $window.scrollTop(); // Fix for scrolling to anchor issue
            window.location.hash = anchor;
            $window.scrollTop(scrollmem);
            $body.removeClass('scrolled-up');

        }});

    });

    // Transitions 

    var $html = $('html'),
        $body = $('body');

    $body.on('click touch', 'a', function(e){

        var el = $(this);
        var href = el.attr('href');
        

        if(el.hasClass('no-transition'))
            return;
        
        e.preventDefault();
        e.stopPropagation();

        $body.removeClass('menu-opened');
        $html.removeClass('loaded');

        setTimeout(function(){
            window.location = href;
        }, 500);
        
    });

    // Animated variables
    var animatedEl = $body.find('.animated');
    var animatedText = $body.find('.animated-text');

    // Animate!
    function animateItems(){

        // Text
        animatedText.each(function(){
            var el = $(this);
            var tl = new TimelineLite;
            el.inViewport(function(pos){
                if(pos > 0 && !el.hasClass('done-animating')){
                    var splitText = new SplitText(el, {type:"words,chars"}),
                        chars = splitText.chars;
                    tl.staggerFrom(chars, 1, {y:80, autoAlpha: 0, ease:Quint.easeOut}, 0.02, "+=0");
                    el.addClass('done-animating');
                }
            });
        });
        
        // Other elements
        animatedEl.each(function(){
            var el = $(this);
            el.inViewport(function(pos){
                if(pos > 0 && !el.hasClass('has-animated')){
                    el.addClass('has-animated');
                }
            });
        });

        // Change anchor links according to visible sections
        $anchorSection.inViewport(function(pos){
            var el = $(this);
            var hash = el.attr('id');
            var link = $anchorLink.filter('a[href="#'+hash+'"]');
            if(pos > 0 && pos > window.innerHeight/2 && !link.hasClass('active')){
                $anchorLink.removeClass('active');
                link.addClass('active');
            }
         });
    }

    // When images are loaded

    $body.imagesLoaded(function(){

        nevoLightbox();
        animateItems(); 
        $masonryGrid.isotope('layout');
        $html.addClass('loaded');

    });

    function setAnchors(){

        $anchorLink.each(function(){

            var href = $(this).attr('href');
            
            if(href !== '#'){
                var $anchorSection = $($(this).attr('href'));
                    $anchorSection.addClass('anchor-section');
                    $anchorSection.attr('data-pos', $anchorSection.offset().top);
            }

        });

        $anchorSection = $body.find('.anchor-section');

    }
    
    setAnchors();

    var lastScrollTop = 0; 
    var scrollTop = 0;

    // On scroll
    $window.on('scroll', function(){

        scrollTop = $window.scrollTop();

        if(scrollTop > 0)
            $body.addClass('scrolled');
        else
            $body.removeClass('scrolled');

        if(scrollTop < lastScrollTop)
            $body.addClass('scrolled-up');
        else
            $body.removeClass('scrolled-up');

        lastScrollTop = scrollTop;
        animateItems();
        
    });

    // Exclude links from transitioning
    $body.find('.lightbox, .anchor-link, .filter').addClass('no-transition');

    // Back button fix
    $window.on('unload', function(){
        $window.off('unload');
    });

    $window.bind('pageshow', function(event) {
        if (event.originalEvent.persisted) {
            window.location.reload() 
        }
    });

});