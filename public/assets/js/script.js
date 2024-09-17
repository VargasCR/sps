
      $(document).ready(function(){
        $('.menu-toggle').click(function(){
          $('.menu-toggle').toggleClass('active')
          $('.menu').toggleClass('active')
        });
      });

      $( () => {
    
        //On Scroll Functionality
        $(window).scroll( () => {
          var windowTop = $(window).scrollTop();
          windowTop > 50 ? $('header').addClass('og-hf') : $('header').removeClass('og-hf');
        });
      });

      $('.counting').each(function() {
        var $this = $(this),
        countTo = $this.attr('data-count');
  
      $({ countNum: $this.text()}).animate({
        countNum: countTo
        },

      {

      duration: 3000,
      easing:'linear',
      step: function() {
      $this.text(Math.floor(this.countNum));
    },
      complete: function() {
      $this.text(this.countNum);
      //alert('finished');
    }

    });  
  
  });

  $(document).ready(function() {
    var owl = $('.owl-carousel');
    owl.owlCarousel({
      loop: true,
      margin: 10,
      navRewind: false,
      responsive: {
        0: {
          items: 1
        },

        440:{
          items: 2
        },
        600: {
          items: 3
        },
        1000: {
          items: 4
        }
      }
    })
  })
  
  let showingDropdown = '';
  function myFunction(id) {
    document.querySelectorAll('.dropdown-content').forEach(element => {
      element.classList.remove('show');
    });
    if(showingDropdown != id) {
      showingDropdown = id;
      document.getElementById(id).classList.add("show");
    } else {
      showingDropdown = '';
    }
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

  let showingSubDropdown = '';
  function openSubDropdown(id) {
    const allSubDropdowns = document.querySelectorAll('.subdropdowm');
    allSubDropdowns.forEach(element => {
      element.classList.add('hidden');
    });
    if(id != showingSubDropdown) {
      document.querySelector(`#${id}`).classList.remove('hidden');
      showingSubDropdown = id;
    } else {
      showingSubDropdown = '';
    }
  }