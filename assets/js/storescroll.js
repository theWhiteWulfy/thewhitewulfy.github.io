
//==================================
//=======scroll pos=================
//==================================
;(function($){
  
    /**
     * Store scroll position for and set it after reload
     *
     * @return {boolean} [loacalStorage is available]
     */
    $.fn.scrollPosReaload = function(){
        if (localStorage) {
            var posReader = localStorage["posStorage"];
            if (posReader) {
                $(window).scrollTop(posReader);
                localStorage.removeItem("posStorage");
            }
            $(this).click(function(e) {
                localStorage["posStorage"] = $(window).scrollTop();
            });

            return true;
        }

        return false;
    }
    
    /* ================================================== */

    $(document).ready(function() {
        // Feel free to set it for any element who trigger the reload
        $('select').scrollPosReaload();
    });
  
}(jQuery));  
