/*

Nevo Lightbox JS
Version 1.0

*/

function isYoutube(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false;
  }
  
  function isVimeo(url) {
    var p = /player\.vimeo\.com\/video\/([0-9]*)/;
    return (url.match(p)) ? RegExp.$1 : false;
  }
  
  ;(function($) {
  
    nevoLightbox = function( options ) {
  
      "use strict"; // Strict mode
  
      var $body = $('body');
      var $lightbox = $('<div id="lightbox"><div class="bg"><div class="loader"></div></div><div class="close-lightbox"></div><div class="prev-lightbox-item"></div><div class="next-lightbox-item"></div></div>');
      var curIndex;
      var curItem;
      var galleryTotal;
      var mouseY;
      var mouseX;
      var winHeight;
      var winWidth;
      var yElFactor;
      var xElFactor;
      var yMouseFactor;
      var xMouseFactor;
      var yPos;
      var xPos;
      var scrolled;
      var elWidth;
      var elHeight;
      var naturalElWidth;
      var naturalElHeight;
      var toPosition;
      var fromPosition;
      var initScale;
  
      setIndexes();
      
      $body.on('click', '.lightbox', function(e){
  
        e.preventDefault();
        e.stopImmediatePropagation();
  
        scrolled = $(window).scrollTop();
  
        mouseY = e.pageY-scrolled;
        mouseX = e.pageX;
  
        curItem = this;
        curIndex = parseInt($(curItem).attr('data-index'));
  
        galleryTotal = $(this).closest('.gallery').attr('data-total')-1;
  
        initLightbox(curItem);
  
      });
  
      // Handle prev lightbox item on click
      $body.on('click', '.prev-lightbox-item', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        curIndex = curIndex-1;
        if(curIndex < 0)
          curIndex = (galleryTotal);
        loadNewItem(curIndex,'prev');
      });
  
      // Handle next lightbox item on click
      $body.on('click', '.next-lightbox-item', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        curIndex = curIndex+1;
        if(curIndex > galleryTotal)
          curIndex = 0;
        loadNewItem(curIndex,'next');
      });
  
      function setIndexes(){
  
        var galleryIndex = 0;
        $body.find('.gallery').each(function(){
  
          var $gallery = $(this);
          $gallery.attr('data-gallery', galleryIndex);
          galleryIndex++;
          var dataIndex = 0;
  
          $gallery.find('.lightbox').each(function(){
            $(this).attr('data-index', dataIndex);
            dataIndex++;
            $gallery.attr('data-total',dataIndex);
          });
  
        });
  
      }
  
      function loadFirstItem(){
        var img = new Image();
        img.src = $body.find('.lightbox[data-index="'+curIndex+'"]').attr('href');
  
        img.onload = function(e){
          
          curItem = $(this).clone();
          
          $lightbox.append(curItem);
          setDimensions(this);
          thumbHandler(curItem);
  
        };
        
      }
  
      function loadNewItem(newIndex,direction){
  
        var img = new Image();
        img.src = $body.find('.lightbox[data-index="'+newIndex+'"]').attr('href');
  
        var oldItem = curItem;
        initScale = .6;
  
        if(direction == 'prev')
          toPosition = '200%', fromPosition = '-200%';
        else if(direction == 'next')
          toPosition = '-200%', fromPosition = '200%';
  
        TweenMax.to(oldItem, 1, {
          transform : 'translate3d('+toPosition+',0,0)',
          opacity : 0,
          ease : Power4.easeInOut,
          scale : initScale,
          onComplete : function(){
            oldItem.remove();
          }
  
        });
  
        img.onload = function(e){
          
          curItem = $(this).clone();
          
          $lightbox.append(curItem);
          setDimensions(this);
          thumbHandler(curItem);
  
        };
  
      }
  
      // Initialize (DOM elements for) Lightbox and fadein
  
      function initLightbox(el){
  
        $body.append($lightbox);
  
        $lightbox.show(0);
        $lightbox.find('.bg').fadeIn(500, function(){
          toPosition = 0, fromPosition = 0, initScale = .6;
          loadFirstItem();
        });
  
        // Close lightbox
  
        $lightbox.find('.bg, .close-lightbox').on('click', function(e){
          
          $lightbox.fadeOut(500, function(){
            $lightbox.find('.bg').hide(0);
            $lightbox.remove();
            curItem.remove();
          });
  
          if($body.on('mousemove'))
            $body.off('mousemove');
        
        });
  
      }
  
      $(window).on('resize', function(){
        winHeight = window.innerHeight;
        winWidth = window.innerWidth;
      });
  
      function setDimensions(el){
  
         // True width and height
         elWidth = el.width;
         elHeight = el.height;
         
         naturalElWidth = elWidth;
         naturalElHeight = elHeight;
  
         winHeight = window.innerHeight;
         yMouseFactor = (mouseY/winHeight);
         yElFactor = (winHeight-elHeight);
         yPos = (yMouseFactor*yElFactor)-(yElFactor/2);
  
         winWidth = window.innerWidth;
         xMouseFactor = (mouseX/winWidth);
         xElFactor = (winWidth-elWidth);
         xPos = (xMouseFactor*xElFactor)-(xElFactor/2);
  
         if(yElFactor > 0)
           yPos = 0;
         if(xElFactor > 0)
           xPos = 0;
  
         var aspectRatio = elWidth/elHeight;
  
         // Use these dimensions when item needs to be cropped
         if(elHeight > winHeight){
            elHeight = winHeight-30;
            elWidth = elHeight*aspectRatio;
            $body.off('mousemove');
            curItem.addClass('zoomable');
         }
  
      }
  
      function thumbHandler(thumbClone){
        
        TweenMax.set(thumbClone, {
          position : 'fixed',
          zIndex : 999998,
          autoAlpha : 0,
          height : elHeight+'px',
          width : elWidth+'px',
          top : '50%',
          left : '50%',
          marginTop : -elHeight/2+'px',
          marginLeft : -elWidth/2+'px',
          transform : 'translate3d('+fromPosition+',0,0) scale(.5)',
        });
        
        TweenMax.to(thumbClone, .6, {
          autoAlpha: 1,
          transform : 'translate3d(0,0,0)',
          ease : Quint.easeInOut,
        });
  
        $(thumbClone).on('click', function(){
  
          var el = $(this);
  
          if(el.hasClass('zoomed')){
  
            el.removeClass('zoomed');
            $body.off('mousemove');    
  
            TweenMax.to(thumbClone, 1, {
              height : elHeight+'px',
              width : elWidth+'px',
              marginTop : -elHeight/2+'px',
              marginLeft : -elWidth/2+'px',
              ease : Power4.easeInOut,
              transform : 'translate3d(0,0,0)',
            });
  
          } else if(el.hasClass('zoomable')) {
  
            el.addClass('zoomed');
  
            TweenMax.to(thumbClone, 1, {
              height : naturalElHeight+'px',
              width : naturalElWidth+'px',
              marginTop : -naturalElHeight/2+'px',
              marginLeft : -naturalElWidth/2+'px',
              ease : Power4.easeInOut,
              transform : 'translate3d('+xPos+'px,'+yPos+'px,0)',
            });
  
            parallaxItem();
  
          }
  
        });
      }
  
      // Parallax effect when item dimensions are exceeding window dimensions
  
      function parallaxItem(){
  
        $body.on('mousemove', function(e){
  
          mouseY = e.pageY-scrolled;
          yMouseFactor = ((mouseY/winHeight));
          yPos = (yMouseFactor*yElFactor)-(yElFactor/2);
  
          mouseX = e.pageX;
          xMouseFactor = ((mouseX/winWidth));
          xPos = (xMouseFactor*xElFactor)-(xElFactor/2);
  
          if(yElFactor > 0)
            yPos = 0;
          if(xElFactor > 0)
            xPos = 0;
          
          TweenMax.to('#lightbox .zoomed',.3,{'transform' : 'translate3d('+xPos+'px, '+yPos+'px,0)'});
  
        });
  
      }
  
      return this;
  
    }
  
  })(jQuery);