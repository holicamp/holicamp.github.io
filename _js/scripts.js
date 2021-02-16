window.jQuery = window.$ = require( "jquery" );
require( "velocity-animate/velocity.js" );
require( "lazysizes" );
require( "lazysizes/plugins/unveilhooks/ls.unveilhooks.js" );

// Jquery & Velocity JS included in GULP
$( document ).ready( function() {
    toggleMobileNav();
    ShowHideNav();
});

// Close modal if ESC is pressed
$( document ).keyup( function( e ) {
    e.keyCode === 27 ? removeModal() : null;
} );

$( window ).resize( function() {
    $( ".header" ).removeClass( "hide-nav" ); // Ensure nav will be shown on resize
    $( ".header__links" ).removeAttr( "style" ); // If mobile nav was collapsed, make sure it's show on DESK
    $( ".header__overlay" ).remove(); // Remove mobile navigation overlay in case it was opened
} );

/*-------------------------------------------------------------------------*/
/* MOBILE NAVIGATION */
/* -----------------------------------------------------------------------*/

function toggleMobileNav() {
    $( ".header__toggle" ).click( function() {
        if ( $( ".header__links" ).hasClass( "js--open" ) ) {
            hideMobileNav();
        } else {
            openMobileNav();
        }
    });

    $( "body" ).on( "click", function( e ) {
      if ( e.target.classList.contains( "header__overlay" ) ) {
        hideMobileNav();
      } else {
        return;
      }
    } );
}

function openMobileNav() {
    $( ".header__links" ).velocity( "slideDown", {
        duration: 300,
        easing: "ease-out",
        display: "block",
        visibility: "visible",
        begin: function() {
            $( ".header__toggle" ).addClass( "--open" );
            $( "body" ).append( "<div class='header__overlay'></div>" );
        },
        progress: function() {
            $( ".header__overlay" ).addClass( "--open" );
        },
        complete: function() {
            $( this ).addClass( "js--open" );
        }
    } );
}

function hideMobileNav() {
    $( ".header__overlay" ).remove();
    $( ".header__links" ).velocity( "slideUp", {
        duration: 300,
        easing: "ease-out",
        display: "none",
        visibility: "hidden",
        begin: function() {
            $( ".header__toggle" ).removeClass( "--open" );
        },
        progress: function() {
            $( ".header__overlay" ).removeClass( "--open" );
        },
        complete: function() {
            $( this ).removeClass( "js--open" );
            $( ".header__toggle, .header__overlay" ).removeClass( "--open" );
        }
    } );
}

// Also support hash links for mobile nav so we hideMobileNav() upon click
$("a.header__link[href*='#']").click(function () {
    if ( $( ".header__links" ).hasClass( "js--open" ) ) {
        hideMobileNav();
    }
});

/*-------------------------------------------------------------------------*/
/* SHOW/SCROLL NAVIGATION */
/* -----------------------------------------------------------------------*/

function ShowHideNav() {
    var previousScroll = 0, // previous scroll position
        $header = $( ".header" ), // just storing header in a variable
        navHeight = $header.outerHeight(), // nav height
        detachPoint = 576 + 60, // after scroll past this nav will be hidden
        hideShowOffset = 6; // scroll value after which nav will be shown/hidden

    $( window ).scroll( function() {
        var wW = 1024;

        // if window width is more than 1024px start show/hide nav
        if ( $( window ).width() >= wW ) {
            if ( !$header.hasClass( "fixed" ) ) {
                var currentScroll = $( this ).scrollTop(),
                    scrollDifference = Math.abs( currentScroll - previousScroll );

                // if scrolled past nav
                if ( currentScroll > navHeight ) {

                    // if scrolled past detach point -> show nav
                    if ( currentScroll > detachPoint ) {
                        if ( !$header.hasClass( "fix-nav" ) ) {
                            $header.addClass( "fix-nav" );
                        }
                    }

                    if ( scrollDifference >= hideShowOffset ) {
                        if ( currentScroll > previousScroll ) {

                            // scroll down -> hide nav
                            if ( !$header.hasClass( "hide-nav" ) ) {
                                $header.addClass( "hide-nav" );
                              }
                        } else {

                            // scroll up -> show nav
                            if ( $header.hasClass( "hide-nav" ) ) {
                                $( $header ).removeClass( "hide-nav" );
                            }
                        }
                    }
                } else {

                    // at the top
                    if ( currentScroll <= 0 ) {
                        $header.removeClass( "hide-nav show-nav" );
                        $header.addClass( "top" );
                    }
                }
            }

            // scrolled to the bottom -> show nav
            if ( ( window.innerHeight + window.scrollY ) >= document.body.offsetHeight ) {
                $header.removeClass( "hide-nav" );
            }
            previousScroll = currentScroll;
        } else {
            $header.addClass( "fix-nav" );
        }
    } );
}

/*-------------------------------------------------------------------------*/
/* HANDLE MODAL */
/* -----------------------------------------------------------------------*/

function openModal() {
    $( "body" ).css( "overflow", "hidden" );
    $( ".modal, .modal__overlay" ).show().css( "display", "flex" );
    $( ".modal__inner" ).velocity( { translateY: 0, opacity: 1 } );
    $( ".modal__overlay" ).velocity( { opacity: 1 }, 100 );
}

function removeModal() {
    $( "body" ).css( { "overflow": "visible" } );
    $( ".modal, .modal__overlay, .modal__inner" ).velocity( { opacity: 0 }, function() {
        $( ".modal" ).css( { opacity: 1 } );
        $( ".modal__inner" ).css( {
            "-webkit-transform": "translateY(200px)",
            "-ms-transform": "translateY(200px)",
            transform: "translateY(200px)"
        } );
        $( ".modal, .modal__overlay" ).hide();
        $( ".modal__body" ).empty();
    } );
}

$( ".js-modal-close" ).click( function() {
    removeModal();
} );

$( ".modal__overlay" ).click( function() {
    removeModal();
} );
