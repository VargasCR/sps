function openTab(evt, id) {
    //alert(id)
    const alltabs = document.querySelectorAll('.tabcontent');
    alltabs.forEach(element => {
        element.classList.remove('active');
    });
    const tab = document.querySelector('#tab-'+id);
    tab.classList.add('active');
    //alert(id)
    /*for (i = 0; i < tabcontent.length; i++) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(id).style.display = "block";
    evt.currentTarget.className += " active";*/
  }

  function openCourseDetails(id) {
    const tab = document.querySelector('#tab-'+id).classList.remove('hidden');
    document.querySelector('.og-hf').classList.add('hidden');
  }
  function closeTab (id) {
    const tab = document.querySelector('#tab-'+id).classList.add('hidden');
    document.querySelector('.og-hf').classList.remove('hidden');
  }
  function handleFileChange(input) {
    var guardarBtn = document.getElementById('guardar-btn');
    if (input.files && input.files[0]) {
        guardarBtn.style.display = 'block';  // Muestra el botón guardar
    } else {
        guardarBtn.style.display = 'none';   // Oculta el botón guardar si no hay archivo seleccionado
    }
}

document.getElementById('emailForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

  const formData = new FormData(this);
  const text = formData.get('text');
  const email = formData.get('email');

  try {
    const response = await fetch('/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, email }),
    });

    await response.json();
    //console.log(response)
    //console.log(response.ok)
    if(response.ok) {
      Swal.fire({
        icon: "success",
        title: "Listo",
        text: 'Email enviado exitosamente.',
        confirmButtonColor: "#3085d6"
    });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: 'Error al enviar el email.',
        confirmButtonColor: "#3085d6"
    });
    }
  } catch (error) {
    console.error('Error:', error);
    //document.getElementById('responseMessage').innerText = '';
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: 'Error de red o interno.',
      confirmButtonColor: "#3085d6"
  });
  }
});


let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slides[slideIndex-1].style.display = "block";  
}