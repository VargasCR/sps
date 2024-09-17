var express = require('express');
const {findTourFromID,findCourseFromID,findActiveCourses,findEvaluation,findFlag,findAllFlag,findCourseMaterial, findCourseName} = require('../includes/courses');
const {carnet,carnetSWR,carnetWFA,evaluacionWFA,evaluacionACA, evaluationACASWR,evaluacionSK,carnetACA} = require('../includes/templates');
const {writeBD,findBD} = require('../includes/database');
const {Email} = require('../includes/email');
var router = express.Router();
const bcrypt = require('bcrypt');
const pdf = require('html-pdf-node');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const fsp = require('fs').promises;

  router.post('/email/send', async function(req, res, next) {
    try {
      
      const { text, email } = req.body;
      const solved = await Email(text, email);
      res.status(200).json({ success: solved });
    } catch (error) {
      console.error('Error in sending email:', error);
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
    return;
  });

// Configura Multer con función de nombre de archivo personalizada
const storage = multer.diskStorage({
  destination: 'public/uploads/', // Indica la carpeta donde se guardarán los archivos
  filename: function(req, file, cb) {
    // Genera un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop(); // Obtiene la extensión del archivo original
    // Define el nombre completo del archivo
    const filename = file.fieldname + '-' + uniqueSuffix + '.' + extension;

    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Ruta para manejar la carga de archivos
router.post('/upload', upload.single('file'), async function(req, res, next) {
  try {
    const id = req.body.id; // Obtén el ID del formulario
    const filename = req.file.filename; // Nombre del archivo guardado
    const filePath = path.join('public/uploads/', filename);

    // Verifica si la imagen es cuadrada
    const image = sharp(filePath);
    const metadata = await image.metadata();
    let usersText = await findBD('users.json');
    let users = JSON.parse(usersText);
    let userLocal = {};
    users.forEach(user => {
      if(user.id == id) {
        userLocal = user;
        user.foto = filename;
      }
    });
    if (metadata.width !== metadata.height) {
      // El archivo no es una imagen cuadrada
      await fsp.unlink(filePath); // Borra el archivo subido
      if (userLocal.admin == 1) {
        return res.redirect(`/profile/admin?ee11cbb19052e40b07aac0ca060c23ee=${userLocal.id}`);
      } else if (userLocal.tipo_cuenta == 1) {
        return res.redirect(`/profile/instructor?ee11cbb19052e40b07aac0ca060c23ee=${userLocal.id}`);
      } else if (userLocal.tipo_cuenta == 2) {
        return res.redirect(`/profile/student?ee11cbb19052e40b07aac0ca060c23ee=${userLocal.id}`);
      }
      //return res.status(400).json({ error: 'La imagen debe ser cuadrada.' });
    }

    // Si es cuadrada, continúa con el resto del procesamiento
    //console.log(filename);
    //console.log(id);

    
    await writeBD('users.json', users);
    if (userLocal.admin == 1) {
      return res.redirect(`/profile/admin?ee11cbb19052e40b07aac0ca060c23ee=${userLocal.id}`);
    } else if (userLocal.tipo_cuenta == 1) {
      return res.redirect(`/profile/instructor?ee11cbb19052e40b07aac0ca060c23ee=${userLocal.id}`);
    } else if (userLocal.tipo_cuenta == 2) {
      return res.redirect(`/profile/student?ee11cbb19052e40b07aac0ca060c23ee=${userLocal.id}`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la carga de archivos' });
  }
});





router.post('/profile/admin/courses/students/evaluation/verify', async function(req, res, next) {
  const {id,cid,eid} = req.body;
  const certificadosText = await findBD('certificados.json');
  let certificados = JSON.parse(certificadosText);
  //certificados
  
  let i = 0;
  certificados.forEach(element => {
    i = 0;
    if(element.courseID == cid) {
      ////console.log(element_0)
      element.estudiantes.forEach(element_0 => {
        if(element_0 == eid) {
          element.verificado[i] = 1;
        }
        i++;
      });
    }
  });
  await writeBD('certificados.json',certificados);
  const cursosText = await findBD('cursos.json');
  const cursos = JSON.parse(cursosText);
  const curso = cursos.filter(cursox => cursox.id == cid)[0];

  const certificado = certificados.filter(certificado => certificado.courseID == curso.id)[0];
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  let listaIdEstudiantes = [];
  if(certificado != undefined) {
    listaIdEstudiantes = certificado.estudiantes;
  } else {

  }
  let listaEstudiantes = [];
  i = 0;
  listaIdEstudiantes.forEach(element => {
    let estudiante = users.filter(user => user.id == element)[0];
    estudiante.cursoVerificado = certificado.verificado[i]
    i++;
    listaEstudiantes.unshift(estudiante);
  });
  let foto = '';
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
    }
  const codigoError = 0;
  res.render('courseStudents', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    curso:curso,
    listaEstudiantes:listaEstudiantes,
    cid:cid,foto:foto
  });
})

router.get('/tour', async function(req, res, next) {
  const index = req.query.id;
  //console.log(index)
  const tour = findTourFromID(index);
  //console.log(tour)
  let headerCourses = findActiveCourses();
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  res.render('tour', { 
    title: 'Express',
    headerCourses:headerCourses,
    tour:tour
  });
})
router.get('/student-course', async function(req, res, next) {
  const index = req.query.id;
  const course = findCourseFromID(index);
  //console.log(course)
  let headerCourses = findActiveCourses();
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  res.render('studentCourse', { 
    title: 'Express',
    headerCourses:headerCourses,
    course:course
  });
})

router.get('/test', async function(req, res, next) {
  let headerCourses = findActiveCourses();
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  //console.log(headerCourses)
  res.render('aboutTour', { 
    title: 'Express',headerCourses:headerCourses
  });
})

router.get('/student-certified', async function(req, res, next) {
  const {id, course} = req.query;
  const cursosText = await findBD('cursos.json');
  let cursos = JSON.parse(cursosText);
  let curso = cursos.filter(curso => curso.id == course)[0];


  let courseInfo = findCourseFromID(curso.curso);

  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  let user = users.filter(user => user.id == id)[0];

  const nombreCompleto = `${user.nombre} ${user.apellidos}`;

  const evaluacionesText = await findBD('evaluaciones.json');
  let evaluaciones = JSON.parse(evaluacionesText);
  let evaluacion = evaluaciones.filter(evaluacion => evaluacion.courseID == course)[0];

  //console.log('evaluacion');
  ////console.log(evaluaciones);
  ////console.log(courseInfo);

  let item = {
    obtenido:evaluacion.obtenido,
    vence:evaluacion.vence,
    nombre:nombreCompleto,
    dni:user.cedula,
    nombreCurso:courseInfo.name
  }
  let headerCourses = findActiveCourses();
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  res.render('studentCertified', { 
    title: 'Express',
    item:item,
    headerCourses:headerCourses
    
  });
})


router.get('/profile/admin/courses/students/evaluation', async function(req, res, next) {
  const { id,cid,eid } = req.query;
  const cursosText = await findBD('cursos.json');
  let cursos = JSON.parse(cursosText);
  let curso = cursos.filter(curso => curso.id == cid)[0];
  let evaluationText = findEvaluation(curso.curso);

  const evaluacionConsecutivoText = await findBD('evaluacionConsecutivo.txt');
  let evaluacionConsecutivo = JSON.parse(evaluacionConsecutivoText);

  const evaluacionesText = await findBD('evaluaciones.json');
  let evaluaciones = JSON.parse(evaluacionesText);

  const hoy = new Date();
  const dentroDeDosAnios = new Date();
  dentroDeDosAnios.setFullYear(dentroDeDosAnios.getFullYear() + 2);
  const opcionesDeFormato = { year: 'numeric', month: 'numeric', day: 'numeric' };
  
  const fechaHoyFormateada = hoy.toLocaleDateString('es-ES', opcionesDeFormato);
  const fechaEnDosAniosFormateada = dentroDeDosAnios.toLocaleDateString('es-ES', opcionesDeFormato);

  let evaluacion = evaluaciones.filter(evaluacion => evaluacion.userID == eid 
    && cid == evaluacion.courseID)
  if (evaluacion.length == 0) {
    evaluacionConsecutivo++;
    const newEvaluation = {
      id:evaluacionConsecutivo,
      userID:eid,
      courseID:cid,
      points:[],
      aprobado:false,
      obtenido:fechaHoyFormateada,
      vence:fechaEnDosAniosFormateada
    }
    evaluationText.forEach(element => {
      newEvaluation.points.push(1);
    });
    evaluaciones.push(newEvaluation);
    
    evaluacion = newEvaluation;
    await writeBD('evaluaciones.json',evaluaciones);
    await writeBD('evaluacionConsecutivo.txt',evaluacionConsecutivo);
    res.render('accountAdminEvaluation', { 
      title: 'Express',
      id:id,
      cid:cid,
      eid:eid,
      evaluationText:evaluationText,
      evaluacion:newEvaluation
    });
  } else {
    res.render('accountAdminEvaluation', { 
      title: 'Express',
      id:id,
      cid:cid,
      eid:eid,
      foto:foto,
      evaluationText:evaluationText,
      evaluacion:evaluacion[0]
    });
  }
  //return
  ////console.log(evaluacion[0])
  
})


const { PDFDocument, rgb } = require('pdf-lib');
const { isReadable } = require('stream');

// Función para añadir una imagen de marca de agua a un PDF existente
async function addWatermarkImageToPDF(inputBuffer) {
  const imagePath = "./includes/certify/ico.png";
  // Cargar el PDF
  const pdfDoc = await PDFDocument.load(inputBuffer);

  // Obtener todas las páginas del PDF
  const pages = pdfDoc.getPages();

  // Cargar la imagen de marca de agua
  const watermarkImageBytes = fs.readFileSync(imagePath);
  const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);

  // Añadir la imagen de marca de agua a cada página
  for (const page of pages) {
    const { width, height } = page.getSize();

    // Puedes ajustar la posición y el tamaño de la imagen de la marca de agua
    page.drawImage(watermarkImage, {
      x: width / 4,
      y: height / 4,
      width: width / 2,
      height: height / 3,
      opacity: 0.2  // Ajusta la opacidad según sea necesario
    });
  }

  // Serializar el documento modificado a bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
router.post('/profile/admin/courses/close', async function(req, res, next) {
  try {
    await fs.promises.writeFile('arc.txt', 'dataText', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  const { id,cid } = req.body;
  // Define la ruta del archivo
  
  const usersText = await findBD('users.json');
  
try {
    await fs.promises.writeFile('usersText.txt', usersText, 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }

  await sleep(220);
  const certificadosText = await findBD('certificados.json');
try {
    await fs.promises.writeFile('certificadosText.txt', certificadosText, 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }  
await sleep(220);
  
  const evaluacionesText = await findBD('evaluaciones.json');
try {
    await fs.promises.writeFile('evaluacionesText.txt', evaluacionesText, 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
await sleep(220);
  
  const cursosText = await findBD('cursos.json');
try {
    await fs.promises.writeFile('cursosText.txt', cursosText, 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }  
await sleep(220);
  
  const consecutivoPaginatxt = await findBD('consecutivoPagina.json');
  try {
    await fs.promises.writeFile('consecutivoPaginatxt.txt', consecutivoPaginatxt, 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
await sleep(220);
  
  
  let certificados = JSON.parse(certificadosText);
  let cursos = JSON.parse(cursosText);
  let evaluaciones = JSON.parse(evaluacionesText);
  let users = JSON.parse(usersText);
  let consecutivoPagina = JSON.parse(consecutivoPaginatxt);


  try {
    await fs.promises.writeFile('certificados.txt', JSON.stringify(certificados), 'utf8');
    await fs.promises.writeFile('cursos.txt', JSON.stringify(cursos), 'utf8');
    await fs.promises.writeFile('evaluaciones.txt', JSON.stringify(evaluaciones), 'utf8');
    await fs.promises.writeFile('users.txt', JSON.stringify(users), 'utf8');
    await fs.promises.writeFile('consecutivoPagina.txt', JSON.stringify(consecutivoPagina), 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
    console.log(certificados)
    console.log(cursos)
    console.log(evaluaciones)
    console.log(users)
    console.log(consecutivoPagina)
  }


  let curso = {};
  cursos.forEach(element => {
    if(element.id == cid) {
      element.activo = false;
      curso = element;
    }
  });

  let evaluacionesSeleccionadas = evaluaciones.filter(evaluacion => evaluacion.courseID == cid);
  let user = null;
  let matriculados = [];
  evaluacionesSeleccionadas.forEach(element => {
    user = users.filter(user => user.id == element.userID)[0];
    matriculados.push(user);
  });

  let infoCurso = {
    curso:curso,
    matriculados:matriculados,
    evaluaciones:evaluacionesSeleccionadas
  }  
  //await writeBD('cursos.json',cursos);
  const courses = findActiveCourses();
  try {
    await fs.promises.writeFile('courses.txt', JSON.stringify(courses), 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  cursos.forEach(element => {
    user = users.filter(user => user.id == element.instructor)[0];
    if(user) {
      element.instructor = user.nombre +' '+ user.apellidos;
    } else {
      element.instructor = '';
    }
    for (const key in courses) {
      if (courses.hasOwnProperty(key)) {
        const curso = courses[key];
        if(key == element.id) {
          element.nombre = curso.name;
        }
      }
    }
  });

  var options = {
    height: "29.7cm",
    width: "21cm",
    border: "0mm",
  };

console.log(consecutivoPaginatxt)

try {
  await fs.promises.writeFile('matriculados.txt', JSON.stringify(matriculados), 'utf8');
  console.log('Archivo guardado correctamente');
} catch (err) {
  console.error('Error al escribir el archivo:', err);
}
for (const matriculado of matriculados) {
    infoCurso.matriculados = matriculado;
    let documentPDF = ``;
    try {
      await fs.promises.writeFile('matriculado.txt', JSON.stringify(matriculado), 'utf8');
      console.log('Archivo guardado correctamente');
    } catch (err) {
      console.error('Error al escribir el archivo:', err);
    }
    const num = consecutivoPagina[infoCurso.curso.curso] + 1;
    consecutivoPagina[infoCurso.curso.curso] = num;
    await writeBD('consecutivoPagina.json',consecutivoPagina);
	try {
      await fs.promises.writeFile('num.txt', JSON.stringify(consecutivoPagina), 'utf8');
      console.log('Archivo guardado correctamente');
    } catch (err) {
      console.error('Error al escribir el archivo:', err);
    }
    infoCurso.pagina = num;
    if(parseInt(infoCurso.curso.curso) == 14) {
      documentPDF = await evaluacionSK(infoCurso);
    } else if(parseInt(infoCurso.curso.curso) == 7) {
      try {
        await fs.promises.writeFile('3.txt', 'JSON.stringify(matriculados)', 'utf8');
        console.log('Archivo guardado correctamente');
      } catch (err) {
        console.error('Error al escribir el archivo:', err);
      }
      documentPDF = await evaluationACASWR(infoCurso);
      try {
        await fs.promises.writeFile('5.txt', documentPDF, 'utf8');
        console.log('Archivo guardado correctamente');
      } catch (err) {
        console.error('Error al escribir el archivo:', err);
      }
    } else if(parseInt(infoCurso.curso.curso) > 12) {
      documentPDF = await evaluacionWFA(infoCurso);
    }
    else {
      documentPDF = await evaluacionACA(infoCurso);
    }
    const file = { content: documentPDF };
    const pdfBuffer = await pdf.generatePdf(file, { format: 'A4' });
    console.log(pdfBuffer)
    const pdfWithWatermark = await addWatermarkImageToPDF(pdfBuffer);
    let pathx = path.join(__dirname, `../database/certificados/e-${curso.id+'-'+matriculado.id}.pdf`);
    fs.writeFileSync(pathx, pdfWithWatermark);
    console.log(`PDF guardado en: ${pathx}`);
    try {
      await fs.promises.writeFile('33.txt', pathx, 'utf8');
      console.log('Archivo guardado correctamente');
    } catch (err) {
      console.error('Error al escribir el archivo:', err);
    }
  };
  try {
    await fs.promises.writeFile('4.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  //
  try {
    await fs.promises.writeFile('consecutivoPaginaxxx.txt', 'consecutivoPagina', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  for (const matriculado of matriculados) {
    infoCurso.matriculados = matriculado;
    let documentPDF = '';
    // Selecciona la función de generación del PDF en función del curso
    if (parseInt(infoCurso.curso.curso) === 15) {
      documentPDF = await carnetWFA(infoCurso);
    } else if (parseInt(infoCurso.curso.curso) === 7) {
      documentPDF = await carnetSWR(infoCurso);
    } else if (parseInt(infoCurso.curso.curso) > 12) {
      documentPDF = await carnet(infoCurso);
    } else {
      documentPDF = await carnetACA(infoCurso);
    }

    // Genera el archivo PDF
    await sleep(200)
    const file = { content: documentPDF };
    try {
      const pdfBuffer = await pdf.generatePdf(file, options);
      const pathx = path.join(__dirname, `../database/certificados/${curso.id+'-'+matriculado.id}.pdf`); 
      //path = `./database/certificados/${curso.id}-${matriculado.id}.pdf`;
      console.log(`PDF guardado en: ${pathx}`);
      //console.log(`PDF forafat en: ${pdfBuffer}`);
      
      await fs.writeFileSync(pathx, pdfBuffer);
    } catch (error) {
      console.error('Error generando el PDF:', error);
    }
  }
  certificados.forEach(element => {
    if(element.courseID == cid) {
      element.finalizado = true;
    }
  });

  await writeBD('certificados.json',certificados);
  await writeBD('cursos.json',cursos);
  let foto = '';
    if(id) {
        //const usersText = await findBD('users.json');
        //const users = JSON.parse(usersText);
        user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
    }
  res.render('accountAdminCourses', { 
    title: 'Express',
    cursos:cursos,
    id:id,foto:foto
  });
})

router.post('/profile/admin/courses/students/evaluation', async function(req, res, next) {
  const { id,cid,eid,evaid,pregunta } = req.body;
  //return;
  const cursosText = await findBD('cursos.json');
  let cursos = JSON.parse(cursosText);
  let curso = cursos.filter(curso => curso.id == cid)[0];
  let evaluationText = findEvaluation(curso.curso);

  let evaluacion = {};
  const evaluacionesText = await findBD('evaluaciones.json');
  let evaluaciones = JSON.parse(evaluacionesText);
  evaluaciones.forEach(element => {
    if(element.id == evaid) {
      element.points = pregunta;
      evaluacion = element;
    }
  });
  await writeBD('evaluaciones.json',evaluaciones);
  let foto = '';
  if(id) {
      const usersText = await findBD('users.json');
      const users = JSON.parse(usersText);
      let user = users.filter(user => user.id == id)[0];
      nombreCompleto = `${user.nombre} ${user.apellidos}`;
      if(user.foto == '') {
        foto = 'standard.png';
      } else {
        foto = user.foto;
      }
  }
  res.render('accountAdminEvaluation', { 
    title: 'Express',
    id:id,
    cid:cid,
    eid:eid,
    evaluationText:evaluationText,
    evaluacion:evaluacion,foto:foto
  });
})

router.get('/profile/student/courses/subscribed', async function(req, res, next) {
  const { ee11cbb19052e40b07aac0ca060c23ee } = req.query;
  const id = ee11cbb19052e40b07aac0ca060c23ee;
  //console.log(id)
  const certificadosText = await findBD('certificados.json');
  let certificados = JSON.parse(certificadosText);

  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);

  const cursosText = await findBD('cursos.json');
  let cursos = JSON.parse(cursosText);

  let coursesInscribed = []
  let certifiedInscribed = []
  let i = 0;
  certificados.forEach(element => {
    element.estudiantes.forEach(element_0 => {
      //console.log('element_0')
      //console.log('element_0')
      //console.log(element_0)
      if(element_0 == id) {
        certifiedInscribed.push(element);
        cursos.forEach(element_1 => {
          if(element_1.id == element.courseID){
            //console.log(element)
            //console.log(element.verificado)
            element_1.cursoVerificado = element.verificado[i]
            i++;
            coursesInscribed.push(element_1);
          }
        });
      }
    });
  });

  let foto = '';
  let user = users.filter(user => user.id == id)[0];
  const nombreCompleto = `${user.nombre} ${user.apellidos}`;
  if(user.foto == '') {
    foto = 'standard.png';
  } else {
    foto = user.foto;
  }

  const codigoError = 0;
//console.log(coursesInscribed)
  res.render('accountStudentSubscribed', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    //instructors:instructors,
    cursos:coursesInscribed,
    nombreCompleto:nombreCompleto,
    foto:foto,
  });
})


router.get('/student-list', async function(req, res, next) {
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);

  const cursosText = await findBD('cursos.json');
  const cursos = JSON.parse(cursosText);

  const certificadosText = await findBD('certificados.json');
  let certificados = JSON.parse(certificadosText);

  let courses = [];

  let certificado = null;
  let curso = null;
  certificados.forEach(element_certificado => {
    certificado = null;
    certificado = element_certificado;
    curso = null;
    curso = cursos.filter(curso => curso.id == element_certificado.courseID)[0];
    element_certificado.estudiantes.forEach(element_estudianteID => {
      let datos = {
        certificado:'',
        estudiante:'',
        url:'',
        curso:''};
      datos.curso = curso;
      datos.certificado = certificado;
      datos.url = `../database/certificados/${curso.id+'-'+element_estudianteID}.pdf`;
      const estudiante = users.filter(user => user.id == element_estudianteID)[0];
      
      datos.estudiante = estudiante;
      // Crear una nueva fecha con la fecha original
      let fechaOriginal = new Date(curso.final);
  
      // Crear una nueva fecha a partir de la fecha original, sumando dos años
      let nuevaFecha = new Date(fechaOriginal);
      nuevaFecha.setFullYear(fechaOriginal.getFullYear() + 2);
      
      
      let anio = nuevaFecha.getFullYear();
      let mes = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
      let dia = String(nuevaFecha.getDate()).padStart(2, '0');
      let fechaFormateada = `${anio}-${mes}-${dia}`;
      
      //console.log(fechaFormateada);
      datos.curso.expira = fechaFormateada;
      courses.push(datos);
    });
  });
  let headerCourses = findActiveCourses();
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  res.render('studentlist', { 
    title: 'Express',
    courses:courses,
    headerCourses:headerCourses
  })
})

router.post('/profile/student/course/material', async function(req, res, next) {
  const id = req.body.id;
  const curso = req.body.curso;
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  const material = findCourseMaterial(curso);
  
  let foto = '';
  let user = users.filter(user => user.id == id)[0];
  const nombreCompleto = `${user.nombre} ${user.apellidos}`;
  if(user.foto == '') {
    foto = 'standard.png';
  } else {
    foto = user.foto;
  }

  const codigoError = 0;
  //console.log(material)
  res.render('accountStudentMaterial', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    materiales:material,
    //instructors:instructors,
    nombreCompleto:nombreCompleto,
    foto:foto,
  });
})

router.post('/profile/student/subscribe', async function(req, res, next) {
  const {id,userID,cid} = req.body;
  const codigoError = 0;
  const cursosText = await findBD('cursos.json');
  let cursos = JSON.parse(cursosText);
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  let encontrado = false;
  const certificadosText = await findBD('certificados.json');
  let certificados = JSON.parse(certificadosText);
  certificados.forEach(element => {
    if(element.courseID == cid) {
      encontrado = false;
      element.estudiantes.forEach(element_0 => {
        if(element_0 == userID) {
          encontrado = true;
        }
      });
      if(!encontrado) {
        element.estudiantes.push(userID);
        element.verificado.push(0);
        cursos.forEach(element_2 => {
          if(element_2.id == cid) {
            element_2.inscritos++;
            
          }
        });
      }
    }
  });
  await writeBD('certificados.json',certificados);

  await writeBD('cursos.json',cursos);
  cursos.forEach(element => {
    element.matriculado = false;
    certificados.forEach(element_1 => {
      if(element.id ==  element_1.courseID) {
        //console.log(userID)
        //console.log(element_1.estudiantes)
        element_1.estudiantes.forEach(element_2 => {
          if(element_2 == userID) {
            element.matriculado = true;
          }
        });
      }
    });
  })
  let foto = '';
  let user = users.filter(user => user.id == id)[0];
  const nombreCompleto = `${user.nombre} ${user.apellidos}`;
  if(user.foto == '') {
    foto = 'standard.png';
  } else {
    foto = user.foto;
  }
  //return;
  res.render('accountStudent', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    userID:userID,
    //instructors:instructors,
    cursos:cursos,
    nombreCompleto:nombreCompleto,
    foto:foto,
  });
})

router.post('/download', (req, res) => {
  const link = req.body.link;
  const filePath = path.join(__dirname, link); // Ruta al archivo local
  //console.log(filePath)
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error al enviar el archivo:', err.message);
      res.status(500).send('Error al descargar el archivo.');
    }
  });
});

function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day); // Los meses en JavaScript son 0-indexados
}

router.get('/profile/student/courses/certificates', async function(req, res, next) {
  const { ee11cbb19052e40b07aac0ca060c23ee } = req.query;
  const id = ee11cbb19052e40b07aac0ca060c23ee;

  const codigoError = 0;
  const cursosText = await findBD('cursos.json');
  let cursos = JSON.parse(cursosText);
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  const user = users.filter(user => user.id == id)[0];
  let encontrado = false;
  const certificadosText = await findBD('certificados.json');
  let certificados = JSON.parse(certificadosText);
  const evaluacionesText = await findBD('evaluaciones.json');
  let evaluaciones = JSON.parse(evaluacionesText);
  let certificadoVencido = [];
  let certificado = [];
  //console.log(certificados)
  certificados.forEach(element => {
    if(element.finalizado == true) {
      const curso = cursos.filter(curso => curso.id ==element.courseID)[0];
      const evaluacion = evaluaciones.filter(evaluacion => evaluacion.courseID ==element.courseID)[0];

      const courseName = findCourseName(curso.curso,evaluacion.points[0])
console.log('evaluacion')
console.log('evaluacion')
console.log(evaluacion)
      const fechaVence = parseDate(evaluacion.vence);

      // Fecha actual
      const fechaHoy = new Date();

      // Comparación
      const newCertified = {
        'nombre':courseName,
        'vence':evaluacion.vence,
        'link':`../database/certificados/${curso.id+'-'+user.id}.pdf`,
        'elink':`../database/certificados/e-${curso.id+'-'+user.id}.pdf`
      }
      if (fechaVence > fechaHoy) {
        //console.log('La fecha de vencimiento es posterior a la fecha actual.');
        certificado.unshift(newCertified)
      } else if (fechaVence < fechaHoy) {
        //console.log('La fecha de vencimiento es anterior a la fecha actual.');
        certificadoVencido.unshift(newCertified)
      } else {
        certificado.unshift(newCertified)
        //console.log('La fecha de vencimiento es igual a la fecha actual.');
      }
    }
  });

  let foto = '';
  //let user = users.filter(user => user.id == id)[0];
  const nombreCompleto = `${user.nombre} ${user.apellidos}`;
  if(user.foto == '') {
    foto = 'standard.png';
  } else {
    foto = user.foto;
  }
  //return;
  res.render('accountStudentCertify', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    //instructors:instructors,
    certificados:certificado,
    certificadosVencido:certificadoVencido,
    nombreCompleto:nombreCompleto,
    foto:foto,
  });
})


router.post('/profile/student/unsubscribe', async function(req, res, next) {
  const {id,userID,cid} = req.body;
  const codigoError = 0;
  const cursosText = await findBD('cursos.json');
  let cursos = JSON.parse(cursosText);
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  let encontrado = false;
  const certificadosText = await findBD('certificados.json');
  let certificados = JSON.parse(certificadosText);
  let newStudentList = [];
  let newStudentVerify = [];
  //console.log(certificados)
  certificados.forEach(element => {
    if(element.courseID == cid) {
      encontrado = false;
      let index = 0;
      element.estudiantes.forEach(element_0 => {
        if(element_0 == userID) {
          encontrado = true;
        } else {
          newStudentList.push(element_0);
          newStudentVerify.push(element_0.verificado[index]);
        }
        index++;
      });

      
      if(encontrado) {
        element.estudiantes = newStudentList;
        element.verificado = newStudentVerify;
        //element.estudiantes.push(userID);
        cursos.forEach(element_2 => {
          if(element_2.id == cid) {
            element_2.inscritos--;
            element_2.matriculado = false;
          }
        });
      }
    }
  });
  await writeBD('certificados.json',certificados);

  await writeBD('cursos.json',cursos);
  cursos.forEach(element => {
    element.matriculado = false;
    certificados.forEach(element_1 => {
      if(element.id ==  element_1.courseID) {
        //console.log(userID)
        //console.log(element_1.estudiantes)
        element_1.estudiantes.forEach(element_2 => {
          if(element_2 == userID) {
            element.matriculado = true;
          }
        });
      }
    });
  })
  let foto = '';
  let user = users.filter(user => user.id == id)[0];
  const nombreCompleto = `${user.nombre} ${user.apellidos}`;
  if(user.foto == '') {
    foto = 'standard.png';
  } else {
    foto = user.foto;
  }
  //return;
  res.render('accountStudent', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    userID:userID,
    //instructors:instructors,
    cursos:cursos,
    nombreCompleto:nombreCompleto,
    foto:foto,
  });
})

/* GET home page. */


router.get('/', async function(req, res, next) {
  const cursosText = await findBD('cursos.json');
  const cursos = JSON.parse(cursosText);
  console.log(cursos[0].isPublic == 'true');
  const cursosActivos = cursos.filter(curso => curso.activo == 'true' && curso.isPublic == 'true' 
    || curso.activo == true && curso.isPublic == true);
console.log(cursos)
  let headerCourses = findActiveCourses();
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  console.log('cursosActivos')
  console.log(cursosActivos)
  //const courses = findActiveCourses();
  res.render('index', { 
    title: 'Express',
    cursos:cursosActivos,
    headerCourses:headerCourses
    //courses: courses
  });
});

router.get('/login', async function(req, res, next) {
  res.render('login', { 
    title: 'Express',
  });
});

router.get('/contact', async function(req, res, next) {
  let headerCourses = findActiveCourses();
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  res.render('contact', { 
    title: 'Express',
    headerCourses:headerCourses
  });
});

router.get('/staff', async function(req, res, next) {
  let headerCourses = findActiveCourses();
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  res.render('staff', { 
    title: 'Express',
    headerCourses:headerCourses
  });
});

router.get('/gallery', async function(req, res, next) {
  let headerCourses = findActiveCourses();
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  res.render('gallery', { 
    title: 'Express',
    headerCourses:headerCourses
  });
});

router.get('/about', async function(req, res, next) {
  let headerCourses = findActiveCourses();
  let headerCoursesInfo = findActiveCourses();
  let instructorCourses = [];
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {


      const courseFound = {
        index:key,
        name:headerCourses[key].name,
        items:headerCourses[key].items
      }
      instructorCourses.push(courseFound);


      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  res.render('about', { 
    title: 'Express',
    headerCourses:headerCourses,
    instructorCourses:instructorCourses
  });
});
router.get('/instructor-course', async function(req, res, next) {
  const index = req.query.id;
  const course = findCourseFromID(index);

  let headerCourses = findActiveCourses();
  let instructorCourses = [];
  for (const key in headerCourses) {
    if (Object.prototype.hasOwnProperty.call(headerCourses, key)) {
      const element = {
        index:key,
        name:headerCourses[key].name
      }
      headerCourses[key] = element;
    }
  }
  
  //console.log('instructorCourse',course)
  res.render('instructorCourse', { 
    title: 'Express',
    headerCourses:headerCourses,
    course:course
  });
});

router.get('/profile/admin/courses/add', async function(req, res, next) {
  const { ee11cbb19052e40b07aac0ca060c23ee } = req.query;
  const id = ee11cbb19052e40b07aac0ca060c23ee;
  const codigoError = null;
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  let instructors = users.filter(user => user.tipo_cuenta == '1');
  const courses = findActiveCourses();
  let cursosArray = [];
  for (const key in courses) {
    if (courses.hasOwnProperty(key)) {
      const curso = courses[key];
      const cursoObj = {
        id:key,
        nombre:curso.name
      }
      cursosArray.push(cursoObj);
    }
  }
  let foto = '';
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
    }
      
  res.render('addCourse', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    instructors:instructors,
    cursos:cursosArray,foto:foto
  });
})

router.post('/profile/admin/users/delete', async function(req, res, next) {
  const { uid,id } = req.body;
  let codigoError = '0';
  let usersText = await findBD('users.json');
  let users = JSON.parse(usersText);
  let newUsers = [];
  users.forEach(element => {
    if(element.id != uid) {
      newUsers.push(element);
    } 
  });
  await writeBD('users.json',newUsers);
  let instructorsVerified = [];
  let instructorsNoVerified = [];
  let studentsVerified = [];
  let studentsNoVerified = [];
  let admin = [];
  instructorsVerified = newUsers.filter(user => 
    user.admin != 0
    && user.verified == 1
    && user.tipo_cuenta == 1
  );
  instructorsNoVerified = newUsers.filter(user => 
    user.admin != 0 
    && user.verified == 0
    && user.tipo_cuenta == 1
  );
  studentsVerified = newUsers.filter(user => 
    user.admin != 0 
    && user.verified == 1
    && user.tipo_cuenta == 2
  );
  studentsNoVerified = newUsers.filter(user => 
    user.admin != 0 
    && user.verified == 0
    && user.tipo_cuenta == 2
  );
  admin = newUsers.filter(user => 
    user.admin != 0 
    && user.verified == 0
    && user.tipo_cuenta == 2
  );
  let foto = '';
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
    }
  res.render('accountAdminUsers', { 
    title: 'Express',
    codigoError:codigoError,
    id:id,
    instructorsVerified:instructorsVerified,
    instructorsNoVerified:instructorsNoVerified,
    studentsVerified:studentsVerified,
    studentsNoVerified:studentsNoVerified,
    admin:admin,foto:foto
  });
});


// Ruta para manejar la carga de archivos y agregar curso
router.post('/profile/admin/courses/add', upload.single('file'), async function(req, res, next) {
  try {
    const { curso, instructor, inicio, final, location, id, titulo, isInstructor, isPublic } = req.body;
    const file = req.file ? req.file.filename : null; // Obtén el nombre del archivo cargado
    const cursoConsecutivoText = await findBD('cursoConsecutivo.txt');
    let courseID = JSON.parse(cursoConsecutivoText);
    courseID++;

    const newCourse = {
      id: courseID,
      curso: curso,
      instructor: instructor,
      inicio: inicio,
      final: final,
      location: location,
      titulo: titulo,
      inscritos: 0,
      activo: true,
      isInstructor: isInstructor,
      file: file, // Incluye el nombre del archivo aquí
      isPublic: isPublic
    };

    const cursosText = await findBD('cursos.json');
    const cursos = JSON.parse(cursosText);
    cursos.unshift(newCourse);

    const certificadosText = await findBD('certificados.json');
    let certificados = JSON.parse(certificadosText);
    const certificadosConsecutivoText = await findBD('certificadoConsecutivo.txt');
    let certificadoID = JSON.parse(certificadosConsecutivoText);
    certificadoID++;

    const newCertified = {
      id: certificadoID,
      courseID: courseID,
      instructor: instructor,
      estudiantes: [],
      finalizado: false,
      activo: true,
      verificado: []
    };

    certificados.unshift(newCertified);
    await writeBD('certificadoConsecutivo.json', certificadoID);
    await writeBD('certificados.json', certificados);
    await writeBD('cursos.json', cursos);
    await writeBD('cursoConsecutivo.txt', courseID);

    const codigoError = 0;
    const usersText = await findBD('users.json');
    const users = JSON.parse(usersText);
    let instructors = users.filter(user => user.tipo_cuenta != '2');
    const courses = findActiveCourses();
    let cursosArray = [];
    for (const key in courses) {
      if (courses.hasOwnProperty(key)) {
        const curso = courses[key];
        const cursoObj = {
          id: key,
          nombre: curso.name
        };
        cursosArray.push(cursoObj);
      }
    }

    let foto = '';
    if (id) {
      const usersText = await findBD('users.json');
      const users = JSON.parse(usersText);
      let user = users.find(user => user.id == id);
      nombreCompleto = `${user.nombre} ${user.apellidos}`;
      foto = user.foto === '' ? 'standard.png' : user.foto;
    }

    res.render('addCourse', {
      title: 'Express',
      id: id,
      codigoError: codigoError,
      instructors: instructors,
      cursos: cursosArray,
      foto: foto
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la carga de archivos o agregar el curso' });
  }
});


router.post('/profile/admin/courses/delete', async function(req, res, next) {
  const {id,cid} = req.body;
  const cursosText = await findBD('cursos.json');
  const cursos = JSON.parse(cursosText);
  //await writeBD('cursos.json',cursos);
  let Newcursos = [];
  cursos.forEach(element => {
    if(cid != element.id) {
      Newcursos.push(element);
    }
  });
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  let user = users.filter(user => user.id == id)[0];
  nombreCompleto = `${user.nombre} ${user.apellidos}`;
  const courses = findActiveCourses();
  const certificadosText = await findBD('certificados.json');
  const certificados = JSON.parse(certificadosText);
  await writeBD('cursos.json',Newcursos);
  Newcursos.forEach(element => {
    user = users.filter(user => user.id == element.instructor)[0];
    if(user) {
      element.instructor = user.nombre +' '+ user.apellidos;
    } else {
      element.instructor = '';
    }
    for (const key in courses) {
      if (courses.hasOwnProperty(key)) {
        const curso = courses[key];
        if(key == element.id) {
          element.nombre = curso.name;
        }
      }
    }
  });
  let foto = '';
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
    }
  res.render('accountAdminCourses', { 
    title: 'Express',
    nombreCompleto:nombreCompleto,
    cursos:Newcursos,
    id:id,foto:foto
  });
})

// Ruta para manejar la edición de un curso
router.post('/profile/admin/courses/edit', upload.single('file'), async function(req, res, next) {
  try {
    const { curso, instructor, inicio, final, location, cid, titulo, inscritos, activo, verificado,isPublic,isInstructor} = req.body;
    const file = req.file ? req.file.filename : null; // Captura el nombre del archivo si se ha subido uno nuevo
    const id = req.query.ee11cbb19052e40b07aac0ca060c23ee;
    // Crear el objeto del curso actualizado
    const updatedCourse = {
      id: cid,
      curso,
      instructor,
      inicio,
      final,
      location,
      titulo,
      inscritos,
      activo,
      verificado,isPublic,isInstructor,
      file: file ? file : ""// Solo actualizar el archivo si se ha subido uno nuevo
    };
console.log(updatedCourse)
console.log(updatedCourse)
console.log(updatedCourse)
    // Leer y actualizar el archivo de cursos
    const cursosText = await findBD('cursos.json');
    const cursos = JSON.parse(cursosText);
    const updatedCourses = cursos.map(element => element.id == cid ? updatedCourse : element);
    await writeBD('cursos.json', updatedCourses);

    // Obtener datos para renderizar la vista
    const codigoError = 0;
    const usersText = await findBD('users.json');
    const users = JSON.parse(usersText);
    const instructors = users.filter(user => user.tipo_cuenta != '2');

    const courses = findActiveCourses(); // Suponiendo que esta función devuelve un objeto con los cursos activos
    const cursosArray = Object.keys(courses).map(key => ({
      id: key,
      nombre: courses[key].name
    }));

    let foto = '';
    console.log(cid)
    if (id) {
      const user = users.find(user => user.id == id);
      //nombreCompleto = `${user.nombre} ${user.apellidos}`;
      foto = user.foto || 'standard.png'; // Usa la foto del usuario o una por defecto
    }

    res.render('editCourse', { 
      title: 'Express',
      id,
      codigoError,
      instructors,
      cursos: cursosArray,
      curso: updatedCourse,
      cid,
      foto
    });
  } catch (error) {
    next(error);
  }
});

router.post('/profile/admin/courses/students', async function(req, res, next) {
  const { id,cid } = req.body;
  const cursosText = await findBD('cursos.json');
  const cursos = JSON.parse(cursosText);
  const curso = cursos.filter(cursox => cursox.id == cid)[0];

  const certificadosText = await findBD('certificados.json');
  const certificados = JSON.parse(certificadosText);
  const certificado = certificados.filter(certificado => certificado.courseID == curso.id)[0];
  ////console.log(certificados)
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  let listaIdEstudiantes = [];
  if(certificado != undefined) {
    listaIdEstudiantes = certificado.estudiantes;
  } else {

  }
  let listaEstudiantes = [];
  let i = 0;
  listaIdEstudiantes.forEach(element => {
    let estudiante = users.filter(user => user.id == element)[0];
    estudiante.cursoVerificado = certificado.verificado[i]
    i++;
    listaEstudiantes.unshift(estudiante);
  });
  const codigoError = 0;
  let foto = '';
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
    }
  res.render('courseStudents', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    curso:curso,
    listaEstudiantes:listaEstudiantes,
    cid:cid,foto:foto
  });
})

router.post('/profile/admin/courses/students/delete', async function(req, res, next) {
  const { id,cid,eid } = req.body;
  //console.log(id,cid)
  const cursosText = await findBD('cursos.json');
  let cursos = JSON.parse(cursosText);
  cursos.forEach(element => {
    if(cid == element.id) {
      parseInt(element.inscritos)--;
    }
  });
  const curso = cursos.filter(cursox => cursox.id == cid)[0];
  
  const certificadosText = await findBD('certificados.json');
  const certificados = JSON.parse(certificadosText);
  const certificado = certificados.filter(certificado => certificado.courseID == curso.id)[0];
  let listaIdEstudiantes = [];
  certificado.estudiantes.forEach(element => {
    if(eid != element) {
      listaIdEstudiantes.push(element);
    }
  })

  //console.log(certificados)
  const usersText = await findBD('users.json');
  
  const users = JSON.parse(usersText);

  certificado.estudiantes = listaIdEstudiantes;
  await writeBD('certificados.json',listaIdEstudiantes);
  await writeBD('cursos.json',cursos);
  
  let listaEstudiantes = [];
  listaIdEstudiantes.forEach(element => {
    const estudiante = users.filter(user => user.id == element)[0];
    listaEstudiantes.unshift(estudiante);
  });
  let foto = '';
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
    }
  //console.log(listaEstudiantes)
  //console.log(listaIdEstudiantes)
  const codigoError = 0;
  res.render('courseStudents', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    curso:curso,
    listaEstudiantes:listaEstudiantes,
    cid:cid,foto:foto
  });
})
router.get('/profile/admin/courses/edit', async function(req, res, next) {
  const { ee11cbb19052e40b07aac0ca060c23ee } = req.query;
  const id = ee11cbb19052e40b07aac0ca060c23ee;
  const { aac0ca060c23ee } = req.query;
  const cid = aac0ca060c23ee;
  const cursosText = await findBD('cursos.json');
  const cursos = JSON.parse(cursosText);
  const curso = cursos.filter(cursox => cursox.id == cid)[0];
  const courses = findActiveCourses();
  let cursosArray = [];
  for (const key in courses) {
    if (courses.hasOwnProperty(key)) {
      const curso = courses[key];
      const cursoObj = {
        id:key,
        nombre:curso.name
      }
      cursosArray.push(cursoObj);
    }
  }
  codigoError = 0;
  const usersText = await findBD('users.json');
  const users = JSON.parse(usersText);
  let instructors = users.filter(user => user.tipo_cuenta != '2');
  let foto = '';
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
    }
  res.render('editCourse', { 
    title: 'Express',
    id:id,
    codigoError:codigoError,
    instructors:instructors,
    curso:curso,
    cursos:cursosArray,
    cid:cid,foto:foto
  });
})

router.get('/profile/admin', async function(req, res, next) {
    // Obtener los parámetros de la URL
    const { ee11cbb19052e40b07aac0ca060c23ee } = req.query;
    const id = ee11cbb19052e40b07aac0ca060c23ee;
    let nombreCompleto = '';
    let user = null;
    let cursos = [];
    let foto = '';
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
        const cursosText = await findBD('cursos.json');
        cursos = JSON.parse(cursosText);
        const courses = findActiveCourses();
        const certificadosText = await findBD('certificados.json');
        
        const certificados = JSON.parse(certificadosText);

      cursos.forEach(element => {
        user = users.filter(user => user.id == element.instructor)[0];
        if(user) {
          element.instructor = user.nombre +' '+ user.apellidos;
        } else {
          element.instructor = '';
        }
        for (const key in courses) {
          if (courses.hasOwnProperty(key)) {
            const curso = courses[key];
            if(key == element.id) {
              element.nombre = curso.name;
            }
          }
        }
      });
    } else {
        //res.send('No se encontró el parámetro ee11cbb19052e40b07aac0ca060c23ee');
    }
    
  res.render('accountAdmin', { 
    title: 'Express',
    nombreCompleto:nombreCompleto,
    cursos:cursos,
    foto:foto,
    id:id
  });
});

router.get('/profile/student', async function(req, res, next) {
    // Obtener los parámetros de la URL
    const { ee11cbb19052e40b07aac0ca060c23ee } = req.query;
    const id = ee11cbb19052e40b07aac0ca060c23ee;
    let nombreCompleto = '';
    let user = null;
    let userID = null;
    let certificados = [];
    let cursos = [];
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        userID = user.id;
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
        const cursosText = await findBD('cursos.json');
        cursos = JSON.parse(cursosText);
        const certificadosText = await findBD('certificados.json');
        certificados = JSON.parse(certificadosText);
  
        
        

      
        const courses = findActiveCourses();
        
//console.log(userID)

        cursos.forEach(element => {
          element.matriculado = false;
          certificados.forEach(element_1 => {
            if(element.id ==  element_1.courseID) {
              //console.log(userID)
              //console.log(element_1.estudiantes)
              element_1.estudiantes.forEach(element_2 => {
                if(element_2 == userID) {
                  element.matriculado = true;
                }
              });
            }
          });
          //console.log(cursos)
          user = users.filter(user => user.id == element.instructor)[0];
          if(user) {
            element.instructor = user.nombre +' '+ user.apellidos;
          } else {
            element.instructor = '';
          }
          for (const key in courses) {
            if (courses.hasOwnProperty(key)) {
              const curso = courses[key];
              if(key == element.id) {
                element.nombre = curso.name;
              }
            }
          }
        });
      
    } else {
        //res.send('No se encontró el parámetro ee11cbb19052e40b07aac0ca060c23ee');
    }
    
  res.render('accountStudent', { 
    title: 'Express',
    nombreCompleto:nombreCompleto,
    cursos:cursos,
    foto:foto,
    id:id,
    userID:userID
  });
});


router.get('/profile/admin/courses', async function(req, res, next) {
  const { ee11cbb19052e40b07aac0ca060c23ee } = req.query;
  const id = ee11cbb19052e40b07aac0ca060c23ee;
  let nombreCompleto = '';
  let user = null;
  let cursos = [];

  if(id) {
      const usersText = await findBD('users.json');
      const users = JSON.parse(usersText);
      let user = users.filter(user => user.id == id)[0];
      nombreCompleto = `${user.nombre} ${user.apellidos}`;
      const courses = findActiveCourses();
      if(user.foto == '') {
        foto = 'standard.png';
      } else {
        foto = user.foto;
      }
      const cursosText = await findBD('cursos.json');
      cursos = JSON.parse(cursosText);
      
      const certificadosText = await findBD('certificados.json');
      const certificados = JSON.parse(certificadosText);

      cursos.forEach(element => {
        user = users.filter(user => user.id == element.instructor)[0];
        if(user) {
          element.instructor = user.nombre +' '+ user.apellidos;
        } else {
          element.instructor = '';
        }
        for (const key in courses) {
          if (courses.hasOwnProperty(key)) {
            const curso = courses[key];
            if(key == element.id) {
              element.nombre = curso.name;
            }
          }
        }
      });
  } else {
      //res.send('No se encontró el parámetro ee11cbb19052e40b07aac0ca060c23ee');
  }
    
  res.render('accountAdminCourses', { 
    title: 'Express',
    nombreCompleto:nombreCompleto,
    cursos:cursos,
    foto:foto,
    id:id
  });
});




router.get('/profile/admin/users', async function(req, res, next) {
  const { ee11cbb19052e40b07aac0ca060c23ee } = req.query;
  const id = ee11cbb19052e40b07aac0ca060c23ee;
  let instructorsVerified = [];
  let instructorsNoVerified = [];
  let studentsVerified = [];
  let studentsNoVerified = [];
  let admin = [];
  if(id) {
      const usersText = await findBD('users.json');
      const users = JSON.parse(usersText);
      instructorsVerified = users.filter(user => 
        user.admin == 0
        && user.verified == 1
        && user.tipo_cuenta == 1
      );
      instructorsNoVerified = users.filter(user => 
        user.admin == 0
        && user.verified == 0
        && user.tipo_cuenta == 1
      );
      studentsVerified = users.filter(user => 
        user.admin == 0
        && user.verified == 1
        && user.tipo_cuenta == 2
      );
      studentsNoVerified = users.filter(user => 
        user.admin == 0
        && user.verified == 0
        && user.tipo_cuenta == 2
      );
      admin = users.filter(user => 
        user.admin == 0
        && user.verified == 0
        && user.tipo_cuenta == 2
      );
  } else {
      //res.send('No se encontró el parámetro ee11cbb19052e40b07aac0ca060c23ee');
  }
  let foto = '';
    if(id) {
        const usersText = await findBD('users.json');
        const users = JSON.parse(usersText);
        let user = users.filter(user => user.id == id)[0];
        nombreCompleto = `${user.nombre} ${user.apellidos}`;
        if(user.foto == '') {
          foto = 'standard.png';
        } else {
          foto = user.foto;
        }
    }
  res.render('accountAdminUsers', { 
    title: 'Express',
    id:id,
    instructorsVerified:instructorsVerified,
    instructorsNoVerified:instructorsNoVerified,
    studentsVerified:studentsVerified,
    studentsNoVerified:studentsNoVerified,
    admin:admin,foto:foto
  });
});



router.post('/profile/admin/users/verified', async function(req, res, next) {
  const { uid,id } = req.body;
  let codigoError = '0';
  let usersText = await findBD('users.json');

  let users = JSON.parse(usersText);

  const userFound = users.filter(user => user.id == uid)[0];

  users.forEach(element => {
    if(element.id == uid) {
      element.verified = 1;
    }
  });

  await writeBD('users.json',users);

  let instructorsVerified = [];
  let instructorsNoVerified = [];
  let studentsVerified = [];
  let studentsNoVerified = [];
  let admin = [];
 
      
  instructorsVerified = users.filter(user => 
    user.admin == 0
    && user.verified == 1
    && user.tipo_cuenta == 1
  );
  instructorsNoVerified = users.filter(user => 
    user.admin == 0 
    && user.verified == 0
    && user.tipo_cuenta == 1
  );
  studentsVerified = users.filter(user => 
    user.admin == 0 
    && user.verified == 1
    && user.tipo_cuenta == 2
  );
  studentsNoVerified = users.filter(user => 
    user.admin == 0 
    && user.verified == 0
    && user.tipo_cuenta == 2
  );
  admin = users.filter(user => 
    user.admin == 0 
    && user.verified == 0
    && user.tipo_cuenta == 2
  );
  let foto = '';
  if(id) {
      const usersText = await findBD('users.json');
      const users = JSON.parse(usersText);
      let user = users.filter(user => user.id == id)[0];
      nombreCompleto = `${user.nombre} ${user.apellidos}`;
      if(user.foto == '') {
        foto = 'standard.png';
      } else {
        foto = user.foto;
      }
  }
  res.render('accountAdminUsers', { 
    title: 'Express',
    codigoError:codigoError,
    id:id,
    instructorsVerified:instructorsVerified,
    instructorsNoVerified:instructorsNoVerified,
    studentsVerified:studentsVerified,
    studentsNoVerified:studentsNoVerified,
    admin:admin,foto:foto
  });
});


router.get('/singup', function(req, res, next) {
  const flags = findAllFlag();
  res.render('singup', { 
    title: 'Express',
    flags:flags
  });
});


router.post('/singup', async function(req, res, next) {
  const flags = findAllFlag();
  let codigoError = '0';
  const {nombre,
    apellidos,
    tipo_cedula,
    tipo_cuenta,
    cedula,
    contra,
    nacionalidad,
    fecha,
    aca_codigo,
    email,
    telefono,
    sangre,dob
  } = req.body;
  if (!nombre || !apellidos || !tipo_cedula || !tipo_cuenta || !cedula || !contra || !nacionalidad || !dob || !email || !telefono || !sangre) {
    codigoError = '2';
    //console.log(codigoError)
    res.render('singup', { 
      title: 'Express',
      codigoError:codigoError,flags:flags
    });
    return;
  }
  let usersText = await findBD('users.json');
  let users = JSON.parse(usersText);
  const userFound = users.filter(user => user.cedula == cedula);
  //console.log('userFound ',userFound,' : ',userFound.length)
  if(userFound.length != 0) {
    codigoError = '2';
    res.render('singup', { 
      title: 'Express',
      codigoError:codigoError,flags:flags
    });
    return;
  }
  const hashedPassword = await bcrypt.hash(contra, 10);
  let idText = await findBD('userConsecutivo.txt');
  let id = JSON.parse(idText);
  id++;
  let newUser = {
    "id":id,
    "nombre":nombre,
    "apellidos":apellidos,
    "tipo_cedula":tipo_cedula,
    "tipo_cuenta":tipo_cuenta,
    "cedula":cedula,
    "dob":dob,
    "nacionalidad":nacionalidad,
    "fecha":'',
    "aca_codigo":aca_codigo,
    "email":email,
    "telefono":telefono,
    "sangre":sangre,
    "foto":"",
    "pass":hashedPassword,
    "admin":"0",
    "verified":0
  }
  users.unshift(newUser);
  // Usar multer como middleware para subir la foto
  
  /*upload(req, res, async function (err) {
    if (err) {
      // Manejar errores de multer
      console.error(err);
      res.status(400).json({ error: err.message });
    } else {
      try {
        // Aquí puedes acceder al archivo subido con req.file
        if (!req.file) {
          return res.status(400).json({ error: 'Selecciona una imagen' });
        }

        // Aquí puedes manejar el archivo subido, por ejemplo, guardarlo en una base de datos o hacer cualquier procesamiento adicional necesario
        const fotoPath = '/uploads/' + req.file.filename; // Ruta donde se guardó la foto
        newUser.foto = fotoPath;
        // Puedes devolver una respuesta JSON con la ruta de la foto o cualquier otra información necesaria
        res.json({ path: fotoPath });
      } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
      }
    }
  });*/
  await writeBD('userConsecutivo.txt',id);
  await writeBD('users.json',users);
  //console.log(flags);
  res.render('singup', { 
    title: 'Express',
    codigoError:codigoError,
    flags:flags
  });
});









router.post('/login', async function(req, res, next) {
  const { cedula, pass } = req.body;
  let codigoError = '0';
  let usersText = await findBD('users.json');
  let users = JSON.parse(usersText);
  const userFound = users.filter(user => user.cedula == cedula && user.verified == 1);
  if(userFound.length == 0) {
    codigoError = '1';
    res.render('login', {
      title: 'Express',
      codigoError:codigoError
    });
  } else {
    const user = userFound[0];
    const match = await bcrypt.compare(pass, user.pass);
    if (match) {
      if(user.admin == 1) {
        return res.redirect(`/profile/admin?ee11cbb19052e40b07aac0ca060c23ee=${user.id}`);
      } else if(user.tipo_cuenta == 1) {
        return res.redirect(`/profile/instructor?ee11cbb19052e40b07aac0ca060c23ee=${user.id}`);
      } else if(user.tipo_cuenta == 2) {
        return res.redirect(`/profile/student?ee11cbb19052e40b07aac0ca060c23ee=${user.id}`);
      }
    } else {
      codigoError = '2';
      res.render('login', {
        title: 'Express',
        codigoError:codigoError
      });
    }
  }
  res.render('login', { 
    title: 'Express',
    codigoError:codigoError,
  });
});


module.exports = router;