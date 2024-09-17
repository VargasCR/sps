const pdf = require('html-pdf-node');
const path = require('path');
const fs = require('fs');
const {findRequerimentos,findActiveCourses,findEvaluation,findFlag,findAllFlag,findCourseName} = require('../includes/courses');
const bwipjs = require('bwip-js');
const sharp = require('sharp');
const {writeBD,findBD} = require('./database');
function base64Encode(file) {
  const bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString('base64');
}
const carnet = (document) => {
  let evaluacion = document.evaluaciones.filter(eva => eva.userID == document.matriculados.id)[0]
  const courseName = findCourseName(document.curso.curso,evaluacion.points[0])
  const requemientos = findRequerimentos(document.curso.curso); 
  let imagePathIco = '';
  if(document.curso.curso > 12) {
    imagePathIco = path.join(__dirname, '/certify/fecoraftlogo.png');
  } else {
    imagePathIco = path.join(__dirname, '/certify/acalogo.png');
  }
  const imagePath = path.join(__dirname, '/certify/carnet1.png');
  const imagePath2 = path.join(__dirname, '/certify/carnet2.png');
  const imagePathFlag = path.join(__dirname, `/flags/${document.matriculados.nacionalidad.toLowerCase()}.png`);
  const imagePathProfile = path.join(__dirname, `../public/uploads/${document.matriculados.foto}`);
  const base64Image = base64Encode(imagePath);
  const base64ImageIco = base64Encode(imagePathIco);
  const base64Image2 = base64Encode(imagePath2);
  const base64ImageFlag = base64Encode(imagePathFlag);
  const base64ImageProfile = base64Encode(imagePathProfile);
  let level = 1;
  const url = `https://sarapiquipaddlesports.com/student-certified?id=${document.matriculados.id}&course=${document.curso.id}`;
  //console.log(url)
  const barcodeurl = path.join(__dirname, `/certify/barcode.png`);

  bwipjs.toBuffer({
      bcid: 'code128',
      text: url,              
      scale: 3,
      height: 10,
      textxalign: 'center',
  }, function (err, png) {
      if (err) {
          console.error('Error al generar el código de barras:', err);
      } else {
          sharp(png)
            .rotate(90)
            .toFile(barcodeurl, function(err) {
                if (err) {
                    console.error('Error al guardar el archivo rotado:', err);
                } else {
                    //console.log('Código de barras vertical generado y guardado como barcode.png');
                }
            });
      }
  });
  const imageBarCode = path.join(__dirname, '/certify/barcode.png');
  const base64ImageBarCode = base64Encode(imageBarCode);

  document.evaluaciones.forEach(element => {
    if(document.matriculados.id == element.userID) {
      level = element.points[0];
    }
  });
  let pdfContent = `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Factura</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 400px;
    }
    .container {
      position: relative;
      width: 100%;
    }
    .image {
      width: 100%;
    }
    .text-overlay {
      position: absolute;
      top: 94px;
      left: 167px;
      background-color: transparent;
      color: white;
      font-size: 15px;
      font-weight: 700;
      text-align: left;
      padding: 0px;
      width: 300px;
      border-radius: 5px;
    }
    .text-overlay-dob {
      position: absolute;
      top: 119px;
      left: 167px;
      background-color: transparent;
      color: white;
      font-size: 15px;
      font-weight: 700;
      text-align: left;
      padding: 0px;
      width: 300px;
      border-radius: 5px;
    }
    .text-overlay_level {
      position: absolute;
      top: 179px;
      left: 167px;
      background-color: transparent;
      color: white;
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      border-radius: 5px;
    }
    .text-overlay_cname {
      position: absolute;
      text-transform:uppercase;
      top: 45px;
      left: 21px;
      background-color: transparent;
      color: white;
      font-size: 13px;
      font-weight: 700;
      text-align: left;
      padding: 0px;
      width: 100%;
    }
    .img-flag-overlay {
      position: absolute;
      top: 19px;
      right: 23px;
      padding: 0px;
      width: 28px;
    }
    .img-profile-overlay {
      position: absolute;
      top: 81px;
      left: 24px;
      padding: 0px;
      width: 126px;
      max-height:126px;
    }
    .imgico-overlay {
      position: absolute;
      top: 10px;
      left: 33px;
      padding: 0px;
      width: 150px;
      max-height:150px;
    }
    .text-overlay_date {
      position: absolute;
      top: 139px;
      left: 167px;
      background-color: transparent;
      color: white;
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      border-radius: 5px;
    }
    .text-overlay_acaNum {
      position: absolute;
      top: 159px;
      left: 167px;
      background-color: transparent;
      color: white;
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      border-radius: 5px;
    }
    .text-overlay_wrfNum {
      position: absolute;
      top: 179px;
      left: 167px;
      background-color: transparent;
      color: white;
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      border-radius: 5px;
    }
      .text-overlay_valid {
      position: absolute;
      bottom: 7px;
      left: 17px;
      background-color: transparent;
      color: white;
      font-size: 13px;
      font-weight: 700;
      text-align: left;
      padding: 0px;
      width: 260px;
      border-radius: 5px;
    }
    .text-overlay_dni {
      position: absolute;
      bottom: 40px;
      left: 23px;
      color: white;
      font-size: 15px;
      font-weight: 700;
      text-align: left;
      padding: 0px;
      border-radius: 5px;
    }
    .img-barcode {
      position: absolute;
      top: 36px;
      left: 13px;
      padding: 0px;
      width: 45px;
      height:179px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="data:image/png;base64,${base64Image}" alt="" class="image">
    <div class="text-overlay">${document.matriculados.nombre} ${document.matriculados.apellidos}</div>
    <div class="text-overlay-dob">DOB: ${document.matriculados.dob}</div>
    <div class="text-overlay_date">EXP: ${document.curso.final}</div>
    <img src="data:image/png;base64,${base64ImageProfile}" alt="" class="img-profile-overlay">
    <div class="text-overlay_cname">${courseName}</div>
    <div class="text-overlay_valid">Valid Only with: ${requemientos}</div>
    <div class="text-overlay_level">LEVEL ${level}</div>`
    if(document.matriculados.aca_codigo != '') {
      pdfContent += `<div class="text-overlay_acaNum">SPS ID: ${document.matriculados.id}</div>`

    } else {
      pdfContent += `<div class="text-overlay_acaNum">ACA ID: ${document.matriculados.aca_codigo}</div>`
     }
    
    pdfContent += `<div class="text-overlay_dni">DNI: ${document.matriculados.cedula}</div>
    <img src="data:image/png;base64,${base64ImageFlag}" alt="" class="img-flag-overlay">
    </div>
    <br>
    <div class="container">
    <img src="data:image/png;base64,${base64ImageBarCode}" alt="" class="img-barcode">
    <img src="data:image/png;base64,${base64Image2}" alt="" class="image">
  </div>
</body>
</html>
`;
  /////console.log(pdfContent)
  return pdfContent;
}

const carnetACA = async (document) => {
  //await writeBD('consecutivoPagina.json',consecutivoPagina);


  let evaluacion = document.evaluaciones.filter(eva => eva.userID == document.matriculados.id)[0];
  const courseName = findCourseName(document.curso.curso,evaluacion.points[0]);
	const requemientos = findRequerimentos(document.curso.curso);
  const imagePath = path.join(__dirname, '/certify/carnet1swr.png');
  const imagePath2 = path.join(__dirname, '/certify/carnet2swr.png');
  const imagePathFlag = path.join(__dirname, `/flags/${document.matriculados.nacionalidad.toLowerCase()}.png`);
  const imagePathProfile = path.join(__dirname, `../public/uploads/${document.matriculados.foto}`);
  const base64Image = base64Encode(imagePath);  
  const base64Image2 = base64Encode(imagePath2);
  const base64ImageFlag = base64Encode(imagePathFlag);  
  const base64ImageProfile = base64Encode(imagePathProfile);
  let level = 1;
  const url = `https://sarapiquipaddlesports.com/student-certified?id=${document.matriculados.id}&course=${document.curso.id}`;
  //console.log(document)
  const barcodeurl = path.join(__dirname, `/certify/barcode.png`);
  bwipjs.toBuffer({
    bcid: 'code128',
    text: url,              
    scale: 3,
    height: 10,
    textxalign: 'center',
}, function (err, png) {
    if (err) {
        console.error('Error al generar el código de barras:', err);
    } else {
        sharp(png)
          .rotate(90)
          .toFile(barcodeurl, function(err) {
              if (err) {
                  console.error('Error al guardar el archivo rotado:', err);
              } else {
                  //console.log('Código de barras vertical generado y guardado como barcode.png');
              }
          });
    }
});
const imageBarCode = path.join(__dirname, '/certify/barcode.png');
const base64ImageBarCode = base64Encode(imageBarCode);
  document.evaluaciones.forEach(element => {
    if(document.matriculados.id == element.userID) {
      level = element.points[0];
    }
  });
  let pdfContent = `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Factura</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 400px;
    }
    .container {
      position: relative;
      width: 100%;
    }
    .image {
      width: 100%;
    }
      .text-overlay_valid {
      position: absolute;
      top: 13px;
      left: 17px;
      background-color: transparent;
      color: rgb(0, 0, 0);
      font-size: 13px;
      font-weight: 700;
      text-align: left;
      padding: 0px;
      width: 260px;
      border-radius: 5px;
    }
    .text-overlay {
      position: absolute;
      top: 42px;
      right: 1px;
      background-color: red;
      color: rgb(0, 0, 0);
      font-size: 16px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 230px;
      border-radius: 5px;
    }
    .text-overlay_level {
      position: absolute;
      top: 82px;
      right: 17px;
      background-color: transparent;
      color: rgb(0, 0, 0);
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .text-overlay_cname {
      position: absolute;
      top: 120px;
      right: 17px;
      background-color: transparent;
      color: rgb(0, 0, 0);
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .img-flag-overlay {
      position: absolute;
      bottom: 55px;
      right: 13px;
      padding: 0px;
      width: 28px;
      
    }
    .img-profile-overlay {
      position: absolute;
      top: 35px;
      left: 53px;
      padding: 0px;
      width: 115px;
      max-height:110px;
    }
    .text-overlay_date {
      position: absolute;
      bottom: 10px;
      right: 13px;
      color: rgb(0, 0, 0);
      font-size: 13px;
      font-weight: 700;
      text-align: right;
      padding: 0px;
      border-radius: 5px;
    }
    .text-overlay_acaNum {
      position: absolute;
      bottom: 23px;
      right: 13px;
      color: rgb(0, 0, 0);
      font-size: 10px;
      font-weight: 700;
      text-align: right;
      padding: 0px;
      border-radius: 5px;
      }
      .text-overlay_dni {
        position: absolute;
        bottom: 33px;
        right: 13px;
        color: rgb(0, 0, 0);
        font-size: 9px;
        font-weight: 700;
        text-align: right;
        padding: 0px;
        border-radius: 5px; 
      }
        .img-barcode {
      position: absolute;
      top: 13px;
      right: 13px;
      padding: 0px;
      width: 45px;
      height:179px;
    }
      </style>
</head>
<body>
  <div class="container">
    <img src="data:image/png;base64,${base64Image}" alt="" class="image">
    <div class="text-overlay">${document.matriculados.nombre} ${document.matriculados.apellidos}</div>
    <div class="text-overlay_date">Expire: ${document.evaluaciones[0].vence}</div>
    <div class="text-overlay_level">Level ${level}</div>
    <div class="text-overlay_cname">${courseName}</div>`
    if(document.matriculados.aca_codigo != '') {
      pdfContent += `
      <div class="text-overlay_acaNum">ACA #${document.matriculados.aca_codigo}</div>`
      } else {
        pdfContent += `
        <div class="text-overlay_acaNum">SPS #${document.matriculados.id}</div>`

    }
    pdfContent += `
    <img src="data:image/png;base64,${base64ImageProfile}" alt="" class="img-profile-overlay">
    <div class="text-overlay_dni">ID Number: ${document.matriculados.cedula}</div>
    <img src="data:image/png;base64,${base64ImageFlag}" alt="" class="img-flag-overlay">
  </div>
  <br>
  <div class="container">
  <div class="text-overlay_valid">Valid Only with: ${requemientos}</div>
  <img src="data:image/png;base64,${base64ImageBarCode}" alt="" class="img-barcode">
    <img src="data:image/png;base64,${base64Image2}" alt="" class="image">
  </div>
</body>
</html>
`;
  //console.log(pdfContent)
  return pdfContent;
}


const carnetSWR = async (document) => {
  //await writeBD('consecutivoPagina.json',consecutivoPagina
  let evaluacion = document.evaluaciones.filter(eva => eva.userID == document.matriculados.id)[0]
  let courseName = findCourseName(document.curso.curso,evaluacion.points[0])
  const requemientos = findRequerimentos(document.curso.curso);
	if(document.curso.isInstructor == 'true' || document.curso.isInstructor == true) {
    courseName+= ' Instructor'
  }
  const imagePath = path.join(__dirname, '/certify/carnet1swr.png');
  const imagePath2 = path.join(__dirname, '/certify/carnet2swr.png');
  const imagePathFlag = path.join(__dirname, `/flags/${document.matriculados.nacionalidad.toLowerCase()}.png`);
  const imagePathProfile = path.join(__dirname, `../public/uploads/${document.matriculados.foto}`);
if (fs.existsSync(imagePathFlag)) {
    console.log("El archivo existe.");
    try {
      await fs.promises.writeFile('imagePathFlag.txt', 'TREE', 'utf8');
      console.log('Archivo guardado correctamente');
    } catch (err) {
      console.error('Error al escribir el archivo:', err);
    }
  } else {
    console.log("El archivo no existe.");
    try {
      await fs.promises.writeFile('imagePathFlag.txt', 'FALSE', 'utf8');
      console.log('Archivo guardado correctamente');
    } catch (err) {
      console.error('Error al escribir el archivo:', err);
    }
  }
  const base64Image = base64Encode(imagePath);
 
  const base64Image2 = base64Encode(imagePath2);
try {
    await fs.promises.writeFile('0010imagePath.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  const base64ImageFlag = base64Encode(imagePathFlag);
try {
    await fs.promises.writeFile('00110imagePath.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }  
const base64ImageProfile = base64Encode(imagePathProfile);
  let level = 1;
try {
    await fs.promises.writeFile('11imagePath.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  const url = `https://sarapiquipaddlesports.com/student-certified?id=${document.matriculados.id}&course=${document.curso.id}`;
  //console.log(document)
  const barcodeurl = path.join(__dirname, `/certify/barcode.png`);
  try {
    await fs.promises.writeFile('12imagePath.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  bwipjs.toBuffer({
    bcid: 'code128',
    text: url,              
    scale: 3,
    height: 10,
    textxalign: 'center',
}, function (err, png) {
    if (err) {
        console.error('Error al generar el código de barras:', err);
    } else {
        sharp(png)
          .rotate(90)
          .toFile(barcodeurl, function(err) {
              if (err) {
                  console.error('Error al guardar el archivo rotado:', err);
              } else {
                  //console.log('Código de barras vertical generado y guardado como barcode.png');
              }
          });
    }
});
const imageBarCode = path.join(__dirname, '/certify/barcode.png');
const base64ImageBarCode = base64Encode(imageBarCode);
try {
  await fs.promises.writeFile('11imagePath.txt', 'JSON.stringify(imagePath)', 'utf8');
  console.log('Archivo guardado correctamente');
} catch (err) {
  console.error('Error al escribir el archivo:', err);
}
  document.evaluaciones.forEach(element => {
    if(document.matriculados.id == element.userID) {
      level = element.points[0];
    }
  });
  try {
    await fs.promises.writeFile('12imagePath.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  let pdfContent = `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Factura</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 400px;
    }
    .container {
      position: relative;
      width: 100%;
    }
    .image {
      width: 100%;
    }
    .text-overlay {
      position: absolute;
      top: 42px;
      right: 1px;
      background-color: red;
      color: rgb(0, 0, 0);
      font-size: 16px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 230px;
      border-radius: 5px;
    }
    .text-overlay_level {
      position: absolute;
      top: 82px;
      right: 17px;
      background-color: transparent;
      color: rgb(0, 0, 0);
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .text-overlay_cname {
      position: absolute;
      top: 120px;
      right: 17px;
      background-color: transparent;
      color: rgb(0, 0, 0);
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .text-overlay_valid {
      position: absolute;
      top: 13px;
      left: 17px;
      background-color: transparent;
      color: rgb(0, 0, 0);
      font-size: 13px;
      font-weight: 700;
      text-align: left;
      padding: 0px;
      width: 260px;
      border-radius: 5px;
    }
    .img-flag-overlay {
      position: absolute;
      bottom: 55px;
      right: 13px;
      padding: 0px;
      width: 28px;
      
    }
    .img-profile-overlay {
      position: absolute;
      top: 35px;
      left: 53px;
      padding: 0px;
      width: 115px;
      max-height:110px;
    }
    .text-overlay_date {
      position: absolute;
      bottom: 10px;
      right: 13px;
      color: rgb(0, 0, 0);
      font-size: 13px;
      font-weight: 700;
      text-align: right;
      padding: 0px;
      border-radius: 5px;
    }
    .text-overlay_acaNum {
      position: absolute;
      bottom: 23px;
      right: 13px;
      color: rgb(0, 0, 0);
      font-size: 10px;
      font-weight: 700;
      text-align: right;
      padding: 0px;
      border-radius: 5px;
      }
      .text-overlay_dni {
        position: absolute;
        bottom: 33px;
        right: 13px;
        color: rgb(0, 0, 0);
        font-size: 9px;
        font-weight: 700;
        text-align: right;
        padding: 0px;
        border-radius: 5px; 
      }
        .img-barcode {
      position: absolute;
      top: 13px;
      right: 13px;
      padding: 0px;
      width: 45px;
      height:179px;
    }
      </style>
</head>
<body>
  <div class="container">
    <img src="data:image/png;base64,${base64Image}" alt="" class="image">
    <div class="text-overlay">${document.matriculados.nombre} ${document.matriculados.apellidos}</div>
    <div class="text-overlay_date">Expire: ${document.evaluaciones[0].vence}</div>
    <div class="text-overlay_level">Level ${level}</div>
    <div class="text-overlay_cname">${courseName}</div>`
    if(document.matriculados.aca_codigo != '') {
      pdfContent += `
      <div class="text-overlay_acaNum">ACA #${document.matriculados.aca_codigo}</div>`
      } else {
        pdfContent += `
        <div class="text-overlay_acaNum">SPS #${document.matriculados.id}</div>`

    }
    pdfContent += `
    <img src="data:image/png;base64,${base64ImageProfile}" alt="" class="img-profile-overlay">
    <div class="text-overlay_dni">ID Number: ${document.matriculados.cedula}</div>
    
    <img src="data:image/png;base64,${base64ImageFlag}" alt="" class="img-flag-overlay">
  </div>
  <br>
  <div class="container">
  <div class="text-overlay_valid">Valid Only with: ${requemientos}</div>
  <img src="data:image/png;base64,${base64ImageBarCode}" alt="" class="img-barcode">
    <img src="data:image/png;base64,${base64Image2}" alt="" class="image">
  </div>
</body>
</html>
`;
  //console.log(pdfContent)
  return pdfContent;
}

const carnetWFA = (document) => {
  console.log(document.curso)
  let courseName = findCourseName(document.curso.curso)
  if(document.curso.isInstructor == 'true' || document.curso.isInstructor == true) {
    courseName+= ' Instructor'
  }
  const requemientos = findRequerimentos(document.curso.curso);
  let imagePathIco = '';
  if(document.curso.curso > 12) {
    imagePathIco = path.join(__dirname, '/certify/fecoraftlogo.png');
  } else {
    const imagePathProfile = path
.join(__dirname, `../public/uploads/${document.matriculados.foto}`);
const base64ImageProfile = base64Encode(imagePathProfile);
    imagePathIco = path.join(__dirname, '/certify/acalogo.png');
  }
  const imagePath = path.join(__dirname, '/certify/carnet3.png');
  const imagePath2 = path.join(__dirname, '/certify/carnet4.png');
  const imagePathFlag = path.join(__dirname, `/flags/${document.matriculados.nacionalidad.toLowerCase()}.png`);
  const imagePathProfile = path.join(__dirname, `../public/uploads/${document.matriculados.foto}`);
  const base64Image = base64Encode(imagePath);
  const base64ImageIco = base64Encode(imagePathIco);
  const base64Image2 = base64Encode(imagePath2);
  const base64ImageFlag = base64Encode(imagePathFlag);
  const base64ImageProfile = base64Encode(imagePathProfile);
  let level = 1;
  
  document.evaluaciones.forEach(element => {
    if(document.matriculados.id == element.userID) {
      level = element.points[0];
    }
  });
  
  let pdfContent = `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Factura</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 400px;
    } 
    .container {
      position: relative;
      width: 100%;
    }
    .image {
      width: 100%;
    }
    .img-profile-overlay {
      position: absolute;
      top: 98px;
      left: 23px;
      padding: 0px;
      width: 126px;
      max-height:126px;
    }
    .text-overlay {
      position: absolute;
      top: 17px;
      right: 105px;
      background-color: transparent;
      color: #295092;
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .text-overlay_level {
      position: absolute;
      top: 157px;
      right: 105px;
      background-color: transparent;
      color: #295092;
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .text-overlay_text {
      position: absolute;
      top: 167px;
      left: 50px;
      background-color: transparent;
      color: #295092;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 300px;
      border-radius: 5px;
    }
    .text-overlay_cname {
      position: absolute;
      top: 100px;
      right: 105px;
      background-color: transparent;
      color: #295092;
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .img-flag-overlay {
      position: absolute;
      top: 148px;
      left: 13px;
      padding: 0px;
      width: 28px;
    }
    .img-profile-overlay {
      position: absolute;
      top: 28px;
      left: 13px;
      padding: 0px;
      width: 85px;
      max-height:110px;
    }
    .text-overlay_date {
      position: absolute;
      bottom: 42px;
      left: 60px;
      color: #295092;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      border-radius: 5px;
    }
    .text-overlay_acaNum {
      position: absolute;
      bottom: 9.5px;
      left: 100px;
      color: #295092;
      font-size: 10px;
      font-weight: 700;
      text-align: left;
      padding: 0px;
      border-radius: 5px;
      }
      .text-overlay_dni {
        position: absolute;
        top: 138px;
        left: 13px;
        color: #295092;
        font-size: 9px;
        font-weight: 700;
        text-align: center;
        padding: 0px;
        border-radius: 5px;
      }
        .text-overlay_valid {
      position: absolute;
      top: 13px;
      left: 17px;
      background-color: transparent;
      color: rgb(0, 0, 0);
      font-size: 13px;
      font-weight: 700;
      text-align: left;
      padding: 0px;
      width: 260px;
      border-radius: 5px;
    }
      </style>
</head>
<body>
  <div class="container">
    <img src="data:image/png;base64,${base64Image}" alt="" class="image">
    <div class="text-overlay">${document.matriculados.nombre} ${document.matriculados.apellidos}</div>
    <div class="text-overlay_date">${document.curso.final}</div>
    <div class="text-overlay_level">Level ${level}</div>
    <div class="text-overlay_cname">${courseName}</div>
    <div class="text-overlay_acaNum">${document.matriculados.aca_codigo}</div>
    <img src="data:image/png;base64,${base64ImageProfile}" alt="" class="img-profile-overlay">
    
    </div>
    <br>
    <div class="text-overlay_valid">Valid Only with: ${requemientos}</div>
    <div class="container">
    
    <img src="data:image/png;base64,${base64Image2}" alt="" class="image">
    <div class="text-overlay_text">For ${courseName} Knowledge and Techical Skill Develoment</div>
    
    </div>
</body>
</html>
`;

/*let pdfContent = `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Factura</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 400px;
    }
    .container {
      position: relative;
      width: 100%;
    }
    .image {
      width: 100%;
    }
    .text-overlay {
      position: absolute;
      top: 44px;
      right: 17px;
      background-color: transparent;
      color: #295092;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .text-overlay_level {
      position: absolute;
      top: 82px;
      right: 17px;
      background-color: transparent;
      color: #295092;
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .text-overlay_cname {
      position: absolute;
      top: 120px;
      right: 17px;
      background-color: transparent;
      color: #295092;
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      width: 200px;
      border-radius: 5px;
    }
    .img-flag-overlay {
      position: absolute;
      top: 148px;
      left: 13px;
      padding: 0px;
      width: 28px;
    }
    .img-profile-overlay {
      position: absolute;
      top: 28px;
      left: 13px;
      padding: 0px;
      width: 85px;
      max-height:110px;
    }
    .imgico-overlay {
      position: absolute;
      top: 10px;
      left: 33px;
      padding: 0px;
      width: 150px;
      max-height:150px;
    }
    .text-overlay_date {
      position: absolute;
      bottom: 18.5px;
      right: 13px;
      color: rgb(0, 0, 0);
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      border-radius: 5px;
    }
    .text-overlay_acaNum {
      position: absolute;
      bottom: 38px;
      left: 355px;
      color: rgb(0, 0, 0);
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      padding: 0px;
      border-radius: 5px;
      }
      .text-overlay_dni {
        position: absolute;
        top: 138px;
        left: 13px;
        color: rgb(0, 0, 0);
        font-size: 9px;
        font-weight: 700;
        text-align: center;
        padding: 0px;
        border-radius: 5px;
      }
      </style>
</head>
<body>
  <div class="container">
    <img src="data:image/png;base64,${base64Image}" alt="" class="image">
    
    <div class="imgico-overlay">
      <img src="data:image/png;base64,${base64ImageIco}" alt="" class="image">
    </div>
    <div class="text-overlay">${document.matriculados.nombre} ${document.matriculados.apellidos}</div>
    <div class="text-overlay_date">${document.curso.final}</div>
    <div class="text-overlay_level">Level ${level}</div>
    <div class="text-overlay_cname">${courseName}</div>
    <div class="text-overlay_acaNum">${document.matriculados.aca_codigo}</div>
  </div>
  <br>
  <div class="container">
  
    <img src="data:image/png;base64,${base64Image2}" alt="" class="image">
    <div class="text-overlay_dni">DNI: ${document.matriculados.cedula}</div>
    <img src="data:image/png;base64,${base64ImageFlag}" alt="" class="img-flag-overlay">
    <img src="data:image/png;base64,${base64ImageProfile}" alt="" class="img-profile-overlay">
  </div>
</body>
</html>
`;*/
  /////console.log(pdfContent)
  return pdfContent;
}


const evaluacionWFA = (document) => {
  console.log('docxxxument')
  console.log('xxx')
  
  //console.log(document.evaluaciones.points)
  const courseName = findCourseName(document.curso.curso,0)
  const imagePath = path.join(__dirname, '/certify/fecoraft.png');
  const base64Image = base64Encode(imagePath);
  document.matriculados.aca_codigo = document.matriculados.nacionalidad+' '+document.matriculados.id;
  let level = 1;
  let points = [];
  document.evaluaciones.forEach(element => {
    if(document.matriculados.id == element.userID) {
      level = element.points[0];
      points = element.points;
    }
  });
  
  let pdfContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safety Module Evaluation</title>
</head>
<body>
    <style>
        body {
    font-family: Arial, sans-serif;
    margin: 20px;
}

h1, h2, h3 {
    color: #333;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

table, th, td {
    border: 1px solid #ddd;
}

th, td {
    padding: 10px;
    text-align: left;
}

th {
    background-color: #f4f4f4;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

thead th {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #f1f1f1;
}
    </style>
      <p style="width:100%;text-align: left;">${document.pagina}</p>
        <div style="display: flex;justify-content: center;align-items: center;">
            <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
        </div>
    <h2 style="text-align: center;">${courseName}</h2>
    <h2 style="text-align: center;">Evaluation of Costa Rica Rafting Federation Raft Guide License</h2>
    <div style="display: flex;align-items: center;justify-content: center;width: 100%;">
        <table style="width: 50%;">
            <tbody>
                <tr>
                    <td style="width: 32%;">Full Name</td>
                    <td>${document.matriculados.nombre + ' ' +document.matriculados.apellidos}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Birthdate</td>
                    <td>${document.matriculados.dob}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">ID Number</td>
                    <td>${document.matriculados.cedula}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Email Address</td>
                    <td>${document.matriculados.email}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Phone Number</td>
                    <td>${document.matriculados.telefono}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Blood Type</td>
                    <td>${document.matriculados.sangre}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Nacionalidad</td>
                    <td>${document.matriculados.nacionalidad}</td>
                </tr>
                
                <tr>
                    <td style="width: 32%;">Level of License Issued</td>
                    <td>${level}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Month and Year Issued</td>
                    <td>${document.evaluaciones[0].obtenido}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Month and Year Expiration</td>
                    <td>${document.evaluaciones[0].vence}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <h1>Safety Module Evaluation</h1>

    <h2>Safety Module</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Safety Speech (Universal Swimming Position, Throw Bag Rescue, Paddle Rescue, Fall Out, Flip, Self Rescue)</td>`
                if(points[1] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[1] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[1] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                pdfContent += `</tr>
                <td>Dry Land Practice/Flat Water Practice before beginning (Review of guide and safety commands)</td>`
                if(points[2] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[2] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[2] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Ability to Interact and Analyze the External Elements to Set Up Safety Features</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Scouting (Evaluate when necessary, stop in a safe place, evaluate risks and best line)</td>`
                if(points[3] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[3] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[3] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Ability to involve guests in the safety (instructions given to guests in management of safety [swim test on water, pull onto raft, hold onto throw bag, t-grip rescue, throw bag rescue, universal swimming position])</td>`
                if(points[4] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[4] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[4] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Communication (Use of international river signals, be able to decide about critical situations, lines, rescue, water levels, weather, etc)</td>`
                if(points[5] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[5] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[5] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Basics about safety in a raft flotilla</td>`
                if(points[6] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[6] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[6] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Communication with other rafts</td>`
                if(points[7] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[7] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[7] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Aware of other rafts</td>`
                if(points[8] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[8] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[8] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Able to set up safety river running technique (roll and cover, space between rafts, group navigation)</td>`
                if(points[9] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[9] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[9] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Able to make instantaneous stop and set up safety for another raft</td>`
                if(points[10] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[10] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[10] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Help another raft if needed</td>`
                if(points[11] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[11] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[11] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Organize a rescue procedure (by assigning roles, knowledge of rescue techniques low to high risk, and respect the standard and priorities of a rescue)</td>`
                if(points[12] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[12] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[12] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Demonstrate Knowledge of Basic River Rescue</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Swimming Skills (Ferry stops, alternating of Aggressive and Defensive swimming positions)</td>`
                if(points[13] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[13] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[13] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>International River Signals</td>`
                if(points[14] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[14] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[14] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Common Knots, known and used (Figure 8, Double Loop, Follow Through, Prussic, Butterfly knot, Anchors, Etc.)</td>`
                if(points[15] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[15] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[15] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Throw Bag Rescue Technique</td>`
                if(points[16] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[16] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[16] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>2 Times in 20 seconds</td>`
                if(points[17] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[17] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[17] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Spaghetti Method</td>`
                if(points[18] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[18] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[18] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Butterfly Method</td>`
                if(points[19] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[19] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[19] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Overhand</td>`
                if(points[20] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[20] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[20] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Sideways</td>`
                if(points[21] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[21] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[21] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Underhand</td>`
                if(points[22] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[22] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[22] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Raft Wrap (Use of commands and weight to dislodge stuck rafts)</td>`
                if(points[23] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[23] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[23] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Flip Drills (Climb on, check for guests, re-flip, collect guests)</td>`
                if(points[24] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[24] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[24] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Problems Associated with Flat Water (drowning, hypothermia, infection/contamination, traumatic injuries, cramps, sunburn, blisters, etc.)</td>`
                if(points[25] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[25] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[25] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Apply Advanced Rescue Techniques</td>`
                if(points[26] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[26] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[26] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Static and Dynamic Belay with throw rope exercise</td>`
                if(points[27] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[27] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[27] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Set up rescue for unconscious swimmer (Live Bait Rescue)</td>`
                if(points[28] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[28] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[28] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Foot Entrapment</td>`
                if(points[29] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[29] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[29] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Rescue with Tethered Raft</td>`
                if(points[30] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[30] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[30] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Advanced knowledge of rope systems used for rescue in a whitewater environment and wrapped raft (Mechanical Advance Systems)</td>`
                if(points[31] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[31] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[31] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>River Crossing Technique</td>`
                if(points[32] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[32] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[32] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>With paddle</td>`
                if(points[33] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[33] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[33] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>With one other person</td>`
                if(points[34] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[34] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[34] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>With two other people</td>`
                if(points[35] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[35] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[35] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>With 3+ people</td>`
                if(points[36] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[36] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[36] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>With victim</td>`
                if(points[37] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[37] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[37] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Rescue Scenarios</td>`
                if(points[38] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[38] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[38] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Run river section for the level desired</td>`
                if(points[39] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[39] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[39] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Risk Assessment of an Incident Site</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Identification of dangers, risks and prioritization of actions in a rescue</td>`
                if(points[40] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[40] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[40] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Risk assessment</td>`
                if(points[41] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[41] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[41] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Build a rescue situation according to risk assessment</td>`
                if(points[42] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[42] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[42] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Establish Priority in actions accordingly with personal and group safety, airway priority, casualty stabilization and incident containment, with upstream and downstream cover</td>`
                if(points[43] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[43] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[43] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Technical Module</h2>
    <h3>Demonstrate Basic Raft Guide Technique</h3>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Guide Seating Position (Best Position to be able to maneuver the boat)</td>`
                if(points[44] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[44] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[44] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Paddle Strokes</td>`
                if(points[45] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[45] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[45] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Scouting and Running (Choosing the best line in an easy rapid or current while avoiding obstacles)</td>`
                if(points[46] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[46] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[46] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h3>Driving Techniques</h3>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Demonstrate river guiding techniques and skills</td>`
                if(points[47] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[47] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[47] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Required in Class 4 and above rivers (ferry gliding techniques shore to shore, upstream, and downstream)</td>`
                if(points[48] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[48] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[48] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>River features used to assist in efficient maneuverings to ensure a safe and enjoyable river experience for guests</td>`
                if(points[49] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[49] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[49] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Raft stopping technique used in different situations</td>`
                if(points[50] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[50] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[50] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Effective use of a crew in surfing a hole, a wrap and a stuck raft</td>`
                if(points[51] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[51] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[51] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Scouting Lining Portage (Evaluate when it is necessary, risks and best line if runnable. Organize lining system or portage in a safe way while supervising the process)</td>`
                if(points[52] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[52] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[52] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Environment Animation and Knowledge Module</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Hydrology basics and common river hazards</td>`
                if(points[53] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[53] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[53] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Basics of river morphology (Hazards identified and understood, strainers, undercuts (reversals), sieves, eddy lines: smiling, frowning, straight lines; flooded river, low head dams)</td>`
                if(points[54] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[54] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[54] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>River hydrology (mechanics of eddies, current vectors, and of sections of a river in a curve)</td>`
                if(points[55] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[55] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[55] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>International river grading system is described</td>`
                if(points[56] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[56] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[56] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Knowledge of Local Rafting Federal Regulations</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Governance of Sport (National and International)</td>`
                if(points[57] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[57] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[57] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Basic Legal Knowledge (Rights and Obligations, Responsibility: Civil and Penal, Respect the water)</td>`
                if(points[58] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[58] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[58] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Ethics of a Guide</td>`
                if(points[59] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[59] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[59] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Local Fiscal Aspects</td>`
                if(points[60] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[60] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[60] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Knowledge of Rafting Equipment</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Personal Equipment</td>`
                if(points[61] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[61] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[61] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Guest Equipment</td>`
                if(points[62] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[62] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[62] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Raft Construction and Design (Materials and their limitations)</td>`
                if(points[63] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[63] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[63] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Raft Care (Inflation/deflation, loading, transportation, storage)</td>`
                if(points[64] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[64] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[64] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Types and applications of rope in a rafting context</td>`
                if(points[65] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[65] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[65] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Knowledge of Water Regulation and Environment</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Good relationship with the land owners and other users of the waters</td>`
                if(points[66] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[66] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[66] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Environmental Sensibility (No trace ethics)</td>`
                if(points[67] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[67] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[67] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Knowledge about water regulation and environmental awareness (Propose solutions or animate debates about taking care of the environment)</td>`
                if(points[68] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[68] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[68] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Knowledge about Environment and Animation</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Know the basics of animation (create/develop and act with games with public on land and water)</td>`
                if(points[69] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[69] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[69] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Know basic information about the river and local area (river environment, its particularity, and history in a way to promote safety and environmental protection)</td>`
                if(points[70] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[70] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[70] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <h2>Assistant Coach Module (For Class II)</h2>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Basics of Physiology, understanding of energy sectors</td>`
                if(points[71] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[71] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[71] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
            <tr>
                <td>Be able to read a training program</td>`
                if(points[72] == '1') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[72] == '2') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
                if(points[72] == '3') {
                  pdfContent += `<td style="text-align:center;">X</td>`
                } else {
                  pdfContent += `<td></td>`
                }
            pdfContent += `</tr>
        </tbody>
    </table>

    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>


    <div style="display: flex;justify-content: center;align-items: center;">
            <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
        </div>
    <p style="text-align: center;">
        The above evaluation of Raft Guide License (consisted of 40 hours) and level granted, is completed by an instructor from the Costa Rica Rafting Federation, reviewed and approved by the President of the   Costa Rica Rafting Federation.
    </p>
    <p>
        Instructor of the Costa Rica Rafting Federation:
    </p>
        <p>
            Name: Stanley Esquivel Mesen
        </p>
        <p>
            Date: 
        </p>
        <p>
            Signature: ___________________________________________
        </p>
<p>
    If you have any questions, please contact the President of the Costa Rica Rafting Federation at:
</p>
<p>
    Director of Education: Stanley Esquivel Mesen
</p>
<p>
    Email: sarapiquipaddless@gmail.com
</p>
<p>
    Phone Number: +(506) 6043- 7366 
</p>


</body>
</html>
`;
  return pdfContent;
}

const evaluationACASWR = async (document) => {
  
 
  let evaluacion = document.evaluaciones.filter(eva => eva.userID == document.matriculados.id)[0]
  const courseName = findCourseName(document.curso.curso,evaluacion.points[0])
  const imagePath = path.join(__dirname, '/certify/acalogo2.png');

  if (fs.existsSync(imagePath)) {
    console.log("El archivo existe.");
    try {
      await fs.promises.writeFile('imagePathv.txt', 'TREE', 'utf8');
      console.log('Archivo guardado correctamente');
    } catch (err) {
      console.error('Error al escribir el archivo:', err);
    }
  } else {
    console.log("El archivo no existe.");
    try {
      await fs.promises.writeFile('imagePathv.txt', 'FALSE', 'utf8');
      console.log('Archivo guardado correctamente');
    } catch (err) {
      console.error('Error al escribir el archivo:', err);
    }
  }

  try {
    await fs.promises.writeFile('imagePath.txt', JSON.stringify(imagePath), 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  const imagePathEscudo = path.join(__dirname, '/certify/logo.png');
  const imagePathFeco = path.join(__dirname, '/certify/fecoraftlogo.png');
  //const imagePath2 = path.join(__dirname, '/certify/carnet2.png');
  try {
    await fs.promises.writeFile('imagePath4.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  const imagePathFlag = path.join(__dirname, `/flags/${document.matriculados.nacionalidad}.png`);
  const imagePathProfile = path.join(__dirname, `../public/uploads/${document.matriculados.foto}`);
  try {
    await fs.promises.writeFile('imagePath5.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  const base64Image = base64Encode(imagePath);
  const base64Image2 = base64Encode(imagePathEscudo);
  const base64Image3 = base64Encode(imagePathFeco);
  //const base64ImageFlag = base64Encode(imagePathFlag);
  //const base64ImageProfile = base64Encode(imagePathProfile);
  let level = 1;
  try {
    await fs.promises.writeFile('imagePath8.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  document.evaluaciones.forEach(element => {
    if(document.matriculados.id == element.userID) {
      level = element.points[0];
    }
  });
  try {
    await fs.promises.writeFile('imagePath9.txt', 'JSON.stringify(imagePath)', 'utf8');
    console.log('Archivo guardado correctamente');
  } catch (err) {
    console.error('Error al escribir el archivo:', err);
  }
  const questions = findEvaluation(document.curso.curso);
////console.log(questions)
let pdfContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safety Module Evaluation</title>
</head>
<body>
    <style>
        body {
    font-family: Arial, sans-serif;
    margin: 20px;
}

h1, h2, h3 {
    color: #333;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

table, th, td {
    border: 1px solid #ddd;
}

th, td {
    padding: 10px;
    text-align: left;
}

th {
    background-color: #f4f4f4;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

thead th {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #f1f1f1;
}

tbody 
    </style>
    <p style="width:100%;text-align: left;">${document.pagina}</p>
        <div style="display: flex;justify-content: center;align-items: center;">
            <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
        </div>
        
        <h2 style="text-align: center;">Level ${level} - ${courseName}</h2>
        <h2 style="text-align: center;">Evaluation of American Canoe Association</h2>
    <div style="display: flex;align-items: center;justify-content: center;width: 100%;">
        <table style="width: 50%;">
            <tbody>
                <tr>
                    <td style="width: 32%;">Full Name</td>
                    <td>${document.matriculados.nombre + ' ' +document.matriculados.apellidos}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Birthdate</td>
                    <td>${document.matriculados.dob}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">ID Number</td>
                    <td>${document.matriculados.cedula}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Email Address</td>
                    <td>${document.matriculados.email}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Phone Number</td>
                    <td>${document.matriculados.telefono}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Blood Type</td>
                    <td>${document.matriculados.sangre}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Nacionalidad</td>
                    <td>${document.matriculados.nacionalidad}</td>
                </tr>
                
                <tr>
                    <td style="width: 32%;">Level of License Issued</td>
                    <td>${level}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Month and Year Issued</td>
                    <td>${document.evaluaciones[0].obtenido}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Month and Year Expiration</td>
                    <td>${document.evaluaciones[0].vence}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <h1>Safety Module Evaluation</h1>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>`;

  questions.forEach((question, index) => {
    ////console.log(pdfContent)
    if(index > 0) {
      pdfContent += `<tr>
          <td>${question}</td>`;
      
      // Example data, replace with actual points array
      let points = [];
      document.evaluaciones.forEach(element => {
        if(document.matriculados.id == element.userID) {
          level = element.points[0];
          points = element.points;
        }
      });
      ['1','2','3'].forEach(value => {
          if (points[index] == value.toString()) {
              ////console.log(points[index])
              pdfContent += `<td style="text-align:center;">X</td>`;
          } else {
              pdfContent += `<td></td>`;
          }
      });
    }
  });
  pdfContent += `</tr>
      </tbody>
  </table>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <div style="display: flex;justify-content: center;align-items: center;">
      <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
  </div>
  <p style="text-align: center;">
  The above of ACA ${courseName} Evaluation (consisted of 40 hours) and level granted, is completed by an 
  instructor from the ACA Costa Rica, reviewed and approved by the President of the
  \n ACA Costa Rica.
  
  </p>
  
  <p>
      Instructor of the ACA Costa Rica:
  </p>
  <p>
      Name: Stanley Esquivel Mesen
  </p>
  <p>
      Date: ${document.evaluaciones[0].obtenido}
  </p>
  <p>
      Signature: ___________________________________________
  </p>
  <p>
      If you have any questions, please contact the President of the Costa Rica Rafting Federation at:
  </p>
  <p>
      Director of Education: Stanley Esquivel Mesen
  </p>
  <p>
      Email: sarapiquipaddless@gmail.com
  </p>
  <p>
      Phone Number: +(506) 6043- 7366
  </p>
  <h2 style="text-align:center;">International Partners</h2>
  
  <div style="display: flex;justify-content: space-around;align-items: center;">
      <img src="data:image/png;base64,${base64Image2}" style="width: 15%;" alt="">
      <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
      <img src="data:image/png;base64,${base64Image3}" style="width: 15%;" alt="">
  </div>
  </body>
  </html>`;
  return pdfContent;
}
const evaluacionACA = (document) => {
  const imagePath = path.join(__dirname, '/certify/acalogo2.png');
  const imagePathEscudo = path.join(__dirname, '/certify/logo.png');
  const imagePathFeco = path.join(__dirname, '/certify/fecoraftlogo.png');
  const imagePath2 = path.join(__dirname, '/certify/carnet2.png');
  const imagePathFlag = path.join(__dirname, `/flags/${document.matriculados.nacionalidad}.png`);
  const imagePathProfile = path.join(__dirname, `../public/uploads/${document.matriculados.foto}`);
  const base64Image = base64Encode(imagePath);
  const base64Image2 = base64Encode(imagePathEscudo);
  const base64Image3 = base64Encode(imagePathFeco);
  const base64ImageFlag = base64Encode(imagePathFlag);
  const base64ImageProfile = base64Encode(imagePathProfile);
  let level = 1;
  let points = [];

  let courseName = findCourseName(document.curso.curso)
  if(document.curso.isInstructor == 'true' || document.curso.isInstructor == true) {
    courseName+= ' Instructor'
  }
  document.evaluaciones.forEach(element => {
    if(document.matriculados.id == element.userID) {
      level = element.points[0];
      points = element.points;
    }
  });

  const questions = findEvaluation(document.curso.curso); 
let pdfContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safety Module Evaluation</title>
</head>
<body>
    <style>
        body {
    font-family: Arial, sans-serif;
    margin: 20px;
}

h1, h2, h3 {
    color: #333;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

table, th, td {
    border: 1px solid #ddd;
}

th, td {
    padding: 10px;
    text-align: left;
}

th {
    background-color: #f4f4f4;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

thead th {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #f1f1f1;
}
    </style>
    <p style="width:100%;text-align: left;">${document.pagina}</p>
        <div style="display: flex;justify-content: center;align-items: center;">
            <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
        </div>
    <h2 style="text-align: center;">${courseName}</h2>
    <h2 style="text-align: center;">Evaluation of American Canoe Association</h2>
    <div style="display: flex;align-items: center;justify-content: center;width: 100%;">
        <table style="width: 50%;">
            <tbody>
                <tr>
                    <td style="width: 32%;">Full Name</td>
                    <td>${document.matriculados.nombre + ' ' +document.matriculados.apellidos}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Birthdate</td>
                    <td>${document.matriculados.dob}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">ID Number</td>
                    <td>${document.matriculados.cedula}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Email Address</td>
                    <td>${document.matriculados.email}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Phone Number</td>
                    <td>${document.matriculados.telefono}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Blood Type</td>
                    <td>${document.matriculados.sangre}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Nacionalidad</td>
                    <td>${document.matriculados.nacionalidad}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Level of License Issued</td>
                    <td>${level}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Month and Year Issued</td>
                    <td>${document.evaluaciones[0].obtenido}</td>
                </tr>
                
                <tr>
                    <td style="width: 32%;">Month and Year Expiration</td>
                    <td>${document.evaluaciones[0].vence}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    `;

        
    pdfContent += `
    <h1>Safety Module</h1>

    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Safety Speech (Universal Swimming Position, Throw Bag Rescue, Paddle Rescue, Fall Out, Flip, Self Rescue, PFD, Helmets)</td>
                ${generateEvaluationCells(points[1])}
            </tr>
            <tr>
                <td>Dry Land Practice/Flat Water Practice before beginning (Review of guide and safety commands)</td>
                ${generateEvaluationCells(points[2])}
            </tr>
        </tbody>
    </table>

    <h1>Ability to Interact and Analyze the External Elements to Set Up Safety Features</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Scouting (Evaluate when necessary, stop in a safe place, evaluate risks and best line)</td>
                ${generateEvaluationCells(points[3])}
            </tr>
            <tr>
                <td>Ability to involve guests in the safety (instructions given to guests in management of safety)</td>
                ${generateEvaluationCells(points[4])}
            </tr>
            <tr>
                <td>Communication (Use of international river signals, be able to decide about critical situations, lines, rescue, water levels, weather, etc)</td>
                ${generateEvaluationCells(points[5])}
            </tr>
            <tr>
                <td>Basics about safety in a raft flotilla</td>
                ${generateEvaluationCells(points[6])}
            </tr>
            <tr>
                <td>Communication with other rafts</td>
                ${generateEvaluationCells(points[7])}
            </tr>
            <tr>
                <td>Awareness of other rafts</td>
                ${generateEvaluationCells(points[8])}
            </tr>
            <tr>
                <td>Able to set up safety river running technique (roll and cover, space between rafts, group navigation)</td>
                ${generateEvaluationCells(points[9])}
            </tr>
            <tr>
                <td>Able to make instantaneous stop and set up safety for another raft</td>
                ${generateEvaluationCells(points[10])}
            </tr>
            <tr>
                <td>Help another raft if needed</td>
                ${generateEvaluationCells(points[11])}
            </tr>
            <tr>
                <td>Organize a rescue procedure (by assigning roles, knowledge of rescue techniques low to high risk, and respect the standard and priorities of a rescue)</td>
                ${generateEvaluationCells(points[12])}
            </tr>
        </tbody>
    </table>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <h1>Demonstrate Knowledge of Basic River Rescue</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Swimming Skills (Ferry stops, alternating of Aggressive and Defensive swimming positions)</td>
                ${generateEvaluationCells(points[13])}
            </tr>
            <tr>
                <td>International River Signals</td>
                ${generateEvaluationCells(points[14])}
            </tr>
            <tr>
                <td>Common Knots, known and used (Figure 8, Double Loop, Follow Through, Prussic, Butterfly knot, Anchors, Etc.)</td>
                ${generateEvaluationCells(points[15])}
            </tr>
            <tr>
                <td>Throw Bag Rescue Technique</td>
                ${generateEvaluationCells(points[16])}
            </tr>
            <tr>
                <td>2 Times in 20 seconds</td>
                ${generateEvaluationCells(points[17])}
            </tr>
            <tr>
                <td>Spaghetti Method</td>
                ${generateEvaluationCells(points[18])}
            </tr>
            <tr>
                <td>Butterfly Method</td>
                ${generateEvaluationCells(points[19])}
            </tr>
            <tr>
                <td>Overhand</td>
                ${generateEvaluationCells(points[20])}
            </tr>
            <tr>
                <td>Sideways</td>
                ${generateEvaluationCells(points[21])}
            </tr>
            <tr>
                <td>Underhand</td>
                ${generateEvaluationCells(points[22])}
            </tr>
            <tr>
                <td>Raft Wrap (Use of commands and weight to dislodge stuck rafts)</td>
                ${generateEvaluationCells(points[23])}
            </tr>
            <tr>
                <td>Flip Drills (Climb on, check for guests, re-flip, collect guests)</td>
                ${generateEvaluationCells(points[24])}
            </tr>
            <tr>
                <td>Problems Associated with Flat Water (drowning, hypothermia, infection/contamination, tramatic injuries, cramps, sunburn, blisters, etc.)</td>
                ${generateEvaluationCells(points[25])}
            </tr>
            <tr>
                <td>Apply Advanced Rescue Techniques</td>
                ${generateEvaluationCells(points[26])}
            </tr>
            <tr>
                <td>Static and Dynamic Belay with throw rope exercise</td>
                ${generateEvaluationCells(points[27])}
            </tr>
            <tr>
                <td>Set up rescue for unconscious swimmer (Live Bait Rescue)</td>
                ${generateEvaluationCells(points[28])}
            </tr>
            <tr>
                <td>Foot Entrapment</td>
                ${generateEvaluationCells(points[29])}
            </tr>
            <tr>
                <td>Rescue with Tethered Raft</td>
                ${generateEvaluationCells(points[30])}
            </tr>
            <tr>
                <td>Advanced knowledge of rope systems used for rescue in a whitewater environment and wrapped raft (Mechanical Advance Systems)</td>
                ${generateEvaluationCells(points[31])}
            </tr>
            <tr>
                <td>River Crossing Technique</td>
                ${generateEvaluationCells(points[32])}
            </tr>
            <tr>
                <td>With paddle</td>
                ${generateEvaluationCells(points[33])}
            </tr>
            <tr>
                <td>With one other person</td>
                ${generateEvaluationCells(points[34])}
            </tr>
            <tr>
                <td>With two other people</td>
                ${generateEvaluationCells(points[35])}
            </tr>
            <tr>
                <td>With 3+ people</td>
                ${generateEvaluationCells(points[36])}
            </tr>
            <tr>
                <td>With victim</td>
                ${generateEvaluationCells(points[37])}
            </tr>
            <tr>
                <td>Rescue Scenarios</td>
                ${generateEvaluationCells(points[38])}
            </tr>
            <tr>
                <td>Run river section for the level desired</td>
                ${generateEvaluationCells(points[39])}
            </tr>
        </tbody>
    </table>

    <h1>Risk Assessment of an Incident Site</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Identification of dangers, risks and prioritization of actions in a rescue</td>
                ${generateEvaluationCells(points[40])}
            </tr>
            <tr>
                <td>Risk assessment</td>
                ${generateEvaluationCells(points[41])}
            </tr>
            <tr>
                <td>Build a rescue situation according to risk assessment</td>
                ${generateEvaluationCells(points[42])}
            </tr>
            <tr>
                <td>Establish Priority in actions accordingly with personal and group safety, airway priority, casualty stabilization and incident containment, with upstream and downstream cover</td>
                ${generateEvaluationCells(points[43])}
            </tr>
        </tbody>
    </table>

    <h1>Technical Module</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Guide Seating Position (Best Position to be able to maneuver the boat)</td>
                ${generateEvaluationCells(points[44])}
            </tr>
            <tr>
                <td>Paddle Strokes</td>
                ${generateEvaluationCells(points[45])}
            </tr>
            <tr>
                <td>Scouting and Running (Choosing the best line in an easy rapid or current while avoiding obstacles)</td>
                ${generateEvaluationCells(points[46])}
            </tr>
        </tbody>
    </table>

    <h2>Driving Techniques</h2>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Moving Forward</td>
                ${generateEvaluationCells(points[47])}
            </tr>
            <tr>
                <td>Moving Backwards</td>
                ${generateEvaluationCells(points[48])}
            </tr>
            <tr>
                <td>Rotating the boat while moving (left and right)</td>
                ${generateEvaluationCells(points[49])}
            </tr>
            <tr>
                <td>Keep the angle in current</td>
                ${generateEvaluationCells(points[50])}
            </tr>
            <tr>
                <td>Run rapids (Including scouting when necessary)</td>
                ${generateEvaluationCells(points[51])}
            </tr>
            <tr>
                <td>Momentum (accelerate the boat forward while in a rapid)</td>
                ${generateEvaluationCells(points[52])}
            </tr>
        </tbody>
    </table>

    <h1>Environment Animation and Knowledge Module</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Hydrology basics and common river hazards</td>
                ${generateEvaluationCells(points[53])}
            </tr>
            <tr>
                <td>General Knowledge of the River and Area</td>
                ${generateEvaluationCells(points[54])}
            </tr>
            <tr>
                <td>Identification and Understanding of Potential Hazards</td>
                ${generateEvaluationCells(points[55])}
            </tr>
            <tr>
                <td>Knowledge of Common Flora and Fauna</td>
                ${generateEvaluationCells(points[56])}
            </tr>
        </tbody>
    </table>

    <h1>Knowledge of Local Rafting Federal Regulations</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Governance of Sport (National and International)</td>
                ${generateEvaluationCells(points[57])}
            </tr>
            <tr>
                <td>Local Federal Regulations</td>
                ${generateEvaluationCells(points[58])}
            </tr>
            <tr>
                <td>Environment Guidelines and Water Protection</td>
                ${generateEvaluationCells(points[59])}
            </tr>
            <tr>
                <td>Restrictions related to Rafting (Water Levels, Banned Areas, etc.)</td>
                ${generateEvaluationCells(points[60])}
            </tr>
        </tbody>
    </table>

    <h1>Knowledge of Rafting Equipment</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Personal Equipment</td>
                ${generateEvaluationCells(points[61])}
            </tr>
            <tr>
                <td>Knowledge of Raft Equipment</td>
                ${generateEvaluationCells(points[62])}
            </tr>
            <tr>
                <td>Inflation Pressure, Leaks and Repairs</td>
                ${generateEvaluationCells(points[63])}
            </tr>
            <tr>
                <td>Proper Use of Equipment</td>
                ${generateEvaluationCells(points[64])}
            </tr>
            <tr>
                <td>Knowledge of Anchors and Z-Drag</td>
                ${generateEvaluationCells(points[65])}
            </tr>
        </tbody>
    </table>
<br>
    <h1>Knowledge of Water Regulation and Environment</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Good relationship with the land owners and other users of the waters</td>
                ${generateEvaluationCells(points[66])}
            </tr>
            <tr>
                <td>Knowledge of Water Levels and Seasonal Changes</td>
                ${generateEvaluationCells(points[67])}
            </tr>
            <tr>
                <td>Understanding of Dam Operations and its Effects on River Flows</td>
                ${generateEvaluationCells(points[68])}
            </tr>
        </tbody>
    </table>

    <h1>Knowledge about Environment and Animation</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Know the basic of animation (create/develop and act with games with public on land and water)</td>
                ${generateEvaluationCells(points[69])}
            </tr>
            <tr>
                <td>Ability to Animate a Group</td>
                ${generateEvaluationCells(points[70])}
            </tr>
        </tbody>
    </table>

    <h1>Assistant Coach Module (For Class II)</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Topic</th>
                <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Basics of Physiology, understanding of energy sectors</td>
                ${generateEvaluationCells(points[71])}
            </tr>
            <tr>
                <td>Be able to read a training program</td>
                ${generateEvaluationCells(points[72])}
            </tr>
        </tbody>
    </table>`;


    
  pdfContent += `</tr>
      </tbody>
  </table>
  <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
  <div style="display: flex;justify-content: center;align-items: center;">
      <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
  </div>
  <p style="text-align: center;">
  The above of ACA ${courseName} Evaluation (consisted of 40 hours) and level granted, is completed by an 
  instructor from the ACA Costa Rica, reviewed and approved by the President of the
  \n ACA Costa Rica.
  
  </p>
  
  <p>
      Instructor of the ACA Costa Rica:
  </p>
  <p>
      Name: Stanley Esquivel Mesen
  </p>
  <p>
      Date: ${document.evaluaciones[0].obtenido}
  </p>
  <p>
      Signature: ___________________________________________
  </p>
  <p>
      If you have any questions, please contact the President of the Costa Rica Rafting Federation at:
  </p>
  <p>
      Director of Education: Stanley Esquivel Mesen
  </p>
  <p>
      Email: sarapiquipaddless@gmail.com
  </p>
  <p>
      Phone Number: +(506) 6043- 7366 
  </p>
  <h2 style="text-align:center;">International Partners</h2>
  
  <div style="display: flex;justify-content: space-around;align-items: center;">
      <img src="data:image/png;base64,${base64Image2}" style="width: 15%;" alt="">
      <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
      <img src="data:image/png;base64,${base64Image3}" style="width: 15%;" alt="">
  </div>
  </body>
  </html>`;
  
  // Output the generated HTML content
  ////console.log(pdfContent);
  return pdfContent;
}


const evaluacionSK = (document) => {
  ////console.log(document);
  
  let courseName = findCourseName(document.curso.curso)
  if(document.curso.isInstructor == 'true' || document.curso.isInstructor == true) {
    courseName+= ' Instructor'
  };
  const imagePath = path.join(__dirname, '/certify/fecoraft.png');
  const base64Image = base64Encode(imagePath);
  const imagePathACA = path.join(__dirname, '/certify/acalogo2.png');
  const imagePathEscudo = path.join(__dirname, '/certify/logo.png');
  const imagePathFeco = path.join(__dirname, '/certify/fecoraftlogo.png');
  const imagePath2 = path.join(__dirname, '/certify/carnet2.png');
  const imagePathFlag = path.join(__dirname, `/flags/${document.matriculados.nacionalidad.toLowerCase()}.png`);
  const imagePathProfile = path.join(__dirname, `../public/uploads/${document.matriculados.foto}`);
  
  const base64Image2 = base64Encode(imagePathEscudo);
  const base64Image3 = base64Encode(imagePathACA);
  const base64ImageFlag = base64Encode(imagePathFlag);
  const base64ImageProfile = base64Encode(imagePathProfile);
  document.matriculados.aca_codigo = document.matriculados.nacionalidad + ' ' + document.matriculados.id;
  
  let level = 1;
  let points = [];
  document.evaluaciones.forEach(element => {
    if (document.matriculados.id == element.userID) {
      level = element.points[0];
      points = element.points;
    }
  });

  let pdfContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safety Module Evaluation</title>
    <style>
        <style>
        body {
    font-family: Arial, sans-serif;
    margin: 20px;
}

h1, h2, h3 {
    color: #333;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    padding:1rem;
}

table, th, td {
    border: 1px solid #ddd;
}

th, td {
    padding: 10px;
    text-align: left;
}

th {
    background-color: #f4f4f4;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

thead th {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #f1f1f1;
}
    </style>
</head>
<body>

<p style="width:100%;text-align: left;">${document.pagina}</p>
    <div style="display: flex;justify-content: center;align-items: center;">
        <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="Certificate Logo">
    </div>
    <h2 style="text-align: center;">${courseName}</h2>
    <h2 style="text-align: center;">Evaluation of World Raft Federation</h2>
    <div style="display: flex;align-items: center;justify-content: center;width: 100%;">
        <table style="width: 50%;">
            <tbody>
                <tr>
                    <td style="width: 32%;">Full Name</td>
                    <td>${document.matriculados.nombre + ' ' + document.matriculados.apellidos}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Birthdate</td>
                    <td>${document.matriculados.dob}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">ID Number</td>
                    <td>${document.matriculados.cedula}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Email Address</td>
                    <td>${document.matriculados.email}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Phone Number</td>
                    <td>${document.matriculados.telefono}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Blood Type</td>
                    <td>${document.matriculados.sangre}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Nacionalidad</td>
                    <td>${document.matriculados.nacionalidad}</td>
                </tr>
                
                <tr>
                    <td style="width: 32%;">Level of License Issued</td>
                    <td>${level}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Month and Year Issued</td>
                    <td>${document.evaluaciones[0].obtenido}</td>
                </tr>
                <tr>
                    <td style="width: 32%;">Month and Year Expiration</td>
                    <td>${document.evaluaciones[0].vence}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <h1>Course Level Evaluation</h1>

<table>
    <thead>
        <tr>
            <th>Topic</th>
            <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Swimming skills: With and without sprayskirt, execute a slalom course swimming, containing ferries and stops, alternating aggressive and defensive swimming positions.</td>
            ${generateEvaluationCells(points[1])}
        </tr>
        <tr>
            <td>International river signals are known and used: Range stop/go, left/right, OK, swimmer numbers, eddy out, cover/safety, first aid, lost paddle, come to me, rope required, last boat, point, positive, look, do not know (unsure), whistle blast for attention, three short whistle blasts for emergency.</td>
            ${generateEvaluationCells(points[2])}
        </tr>
        <tr>
            <td>Basic knots and anchors are known and used: Bowline, figure-eight, double loop, follow through, on a bight, directional, Italian clove hitch, clove hitch, double fisherman’s, prusik, anchors on shore and raft.</td>
            ${generateEvaluationCells(points[3])}
        </tr>
        <tr>
            <td>Throw bag rescue techniques are known and can be practiced: Characteristics of rope and hazards. Technique to throw a rope, coiling technique for a second throw, communication with swimmer, multiple swimmers, vector pull, belay techniques.</td>
            ${generateEvaluationCells(points[4])}
        </tr>
        <tr>
            <td>Rigging systems: Types of anchors, rope crossing method, MA system (2:1, 3:1, zdrag, pig rig), tensioned diagonal (zip line).</td>
            ${generateEvaluationCells(points[5])}
        </tr>
        <tr>
            <td>Manage a wrap and a flip: Understand the dynamics and errors leading to a wrap/flip.</td>
            ${generateEvaluationCells(points[6])}
        </tr>
        <tr>
            <td>Application of the LAST principle and strategy analysis.</td>
            ${generateEvaluationCells(points[7])}
        </tr>
        <tr>
            <td>Know the procedures for managing a wrap/flip and establish priorities.</td>
            ${generateEvaluationCells(points[8])}
        </tr>
        <tr>
            <td>Kayak abilities and river rescue techniques: Self-rescue technique, Kayak roll is mandatory.</td>
            ${generateEvaluationCells(points[9])}
        </tr>
        <tr>
            <td>In a voluntary flip and swim with kayak, be able to bring back to shore paddle and kayak (no losing equipment).</td>
            ${generateEvaluationCells(points[10])}
        </tr>
        <tr>
            <td>Embark and disembark: Be able to embark/disembark quickly from the kayak.</td>
            ${generateEvaluationCells(points[11])}
        </tr>
        <tr>
            <td>Fast extraction of the throw bag, run on shore, and throw the line.</td>
            ${generateEvaluationCells(points[12])}
        </tr>
        <tr>
            <td>Switch from kayak to raft and raft to kayak (no losing equipment).</td>
            ${generateEvaluationCells(points[13])}
        </tr>
        <tr>
            <td>Swimmer recovery: Strategy for conscious and unconscious swimmers (from low risk to high risk).</td>
            ${generateEvaluationCells(points[14])}
        </tr>
        <tr>
            <td>Superman</td>
            ${generateEvaluationCells(points[15])}
        </tr>
        <tr>
            <td>Tag Line</td>
            ${generateEvaluationCells(points[16])}
        </tr>
        <tr>
            <td>Stern Carry</td>
            ${generateEvaluationCells(points[17])}
        </tr>
        <tr>
            <td>Bow Carry</td>
            ${generateEvaluationCells(points[18])}
        </tr>
        <tr>
            <td>Multiple Swimmers</td>
            ${generateEvaluationCells(points[19])}
        </tr>
        <tr>
            <td>Panicked Swimmer</td>
            ${generateEvaluationCells(points[20])}
        </tr>
        <tr>
            <td>Unconscious Swimmer</td>
            ${generateEvaluationCells(points[21])}
        </tr>
        <tr>
            <td>Equipment recovery: Paddles recovery.</td>
            ${generateEvaluationCells(points[22])}
        </tr>
        <tr>
            <td>Transportation of a raft to shore.</td>
            ${generateEvaluationCells(points[23])}
        </tr>
        <tr>
            <td>Reflipped a raft.</td>
            ${generateEvaluationCells(points[24])}
        </tr>
        <tr>
            <td>“Remote control” guiding: Be able to guide the raft (or the body board and airboat) from the kayak giving the appropriate commands to finish a rapid and bring it to shore.</td>
            ${generateEvaluationCells(points[25])}
        </tr>
        <tr>
            <td>Direct a guideless raft by giving commands from the kayak.</td>
            ${generateEvaluationCells(points[26])}
        </tr>
        <tr>
            <td>Direct a guideless raft by giving commands while pushing raft with the kayak.</td>
            ${generateEvaluationCells(points[27])}
        </tr>
        <tr>
            <td>Enter a guideless raft mid-rapid from the kayak and take control of the raft and crew (must include a ferry glide and eddy out). Must not lose kayak or gear.</td>
            ${generateEvaluationCells(points[28])}
        </tr>
        <tr>
            <td>Exit and enter kayak in a high energy area, for example, a rock in the middle of the river.</td>
            ${generateEvaluationCells(points[29])}
        </tr>
        <tr>
            <td>Ability to interact with external environment and set up safety procedures: Basic knowledge about safety in a raft flotilla.</td>
            ${generateEvaluationCells(points[30])}
        </tr>
        <tr>
            <td>Have a constant awareness of other rafts and efficient communication with rafts.</td>
            ${generateEvaluationCells(points[31])}
        </tr>
        <tr>
            <td>Head count and memorization.</td>
            ${generateEvaluationCells(points[32])}
        </tr>
        <tr>
            <td>Rules for navigation respecting the number of rafts (body boards, airboats), the type of rapids, the number of SK.</td>
            ${generateEvaluationCells(points[33])}
        </tr>
        <tr>
            <td>Knowledge of the distribution of equipment: where is the first aid kit? Spare equipment (repair kit, pump, paddles, fins, oars, lifejacket, etc.).</td>
            ${generateEvaluationCells(points[34])}
        </tr>
        <tr>
            <td>Scouting: In case of running unknown river/rapid or extraordinary conditions (flooded river, fog, etc.), be able to evaluate when scouting is necessary. Stop the raft in a safe place, go to check the river, evaluate the risks, and communicate the best line.</td>
            ${generateEvaluationCells(points[35])}
        </tr>
        <tr>
            <td>Ability to involve participants in the safety briefing: Instructions to participants for efficient management of safety: self-rescue (swim to shore, to raft/body board, airboat), float position, swim to the kayak, establishing cooperation between passengers for safety (pull into raft, T-grip rescue, etc.). Knowledge of the contents of the safety briefing for all the activities supervised by the SK.</td>
            ${generateEvaluationCells(points[36])}
        </tr>
        <tr>
            <td>Demonstrate rescue procedures and techniques.</td>
            ${generateEvaluationCells(points[37])}
        </tr>
        <tr>
            <td>Organize a rescue procedure.</td>
            ${generateEvaluationCells(points[38])}
        </tr>
        <tr>
            <td>Organize a rescue by assigning roles.</td>
            ${generateEvaluationCells(points[39])}
        </tr>
        <tr>
            <td>Knowledge of rescue techniques (from “low risk” to “high risk” rescue).</td>
            ${generateEvaluationCells(points[40])}
        </tr>
        <tr>
            <td>Respect the standard and priorities of a rescue.</td>
            ${generateEvaluationCells(points[41])}
        </tr>
        <tr>
            <td>Apply advanced rescue techniques: Use static and dynamic belay in a throw bag exercise.</td>
            ${generateEvaluationCells(points[42])}
        </tr>
        <tr>
            <td>Be able to set up a rescue for foot entrapment.</td>
            ${generateEvaluationCells(points[43])}
        </tr>
        <tr>
            <td>Be able to set up a rescue with a tethered raft.</td>
            ${generateEvaluationCells(points[44])}
        </tr>
        <tr>
            <td>Advanced knowledge of rope systems used for rescue in white-water river environments and wrapped rafts.</td>
            ${generateEvaluationCells(points[45])}
        </tr>
        <tr>
            <td>River crossing techniques are known and practiced.</td>
            ${generateEvaluationCells(points[46])}
        </tr>
        <tr>
            <td>Rope river crossing techniques are known and practiced.</td>
            ${generateEvaluationCells(points[47])}
        </tr>
        <tr>
            <td>Risk assessment of an incident site: Identification of the dangers, risks, and prioritization of actions in a rescue.</td>
            ${generateEvaluationCells(points[48])}
        </tr>
        <tr>
            <td>Decision making: Decide about accepting risk for the SK (can I do this, should I do this, etc.).</td>
            ${generateEvaluationCells(points[49])}
        </tr>
        <tr>
            <td>Be able to realize a risk assessment of a situation. Build a rescue situation according to the risk assessment.</td>
            ${generateEvaluationCells(points[50])}
        </tr>
        <tr>
            <td>Establish priority in the actions according to personal and group safety, airway priority, casualty stabilization, and incident containment, with upstream and downstream cover.</td>
            ${generateEvaluationCells(points[51])}
        </tr>
    </tbody>
</table>

<h1>Technical Module Evaluation</h1>

<table>
    <thead>
        <tr>
            <th>Topic</th>
            <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Specific kayak techniques: Roll, roll in current, roll with a swimmer, eddy in/out, ferry glide (forward and backward), surf (wave and hole), back surf, use of the cow tail.</td>
            ${generateEvaluationCells(points[52])}
        </tr>
        <tr>
            <td>Scouting and running: To be able to recognize and choose the best way in an easy rapid or current avoiding obstacles.</td>
            ${generateEvaluationCells(points[53])}
        </tr>
    </tbody>
</table>

<h1>Knowledge Module Evaluation</h1>

<table>
    <thead>
        <tr>
            <th>Topic</th>
            <th>Needs Improvement</th>
                <th>Good</th>
                <th>Excellent</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Knowledge of SK equipment: Clothing and personal equipment: Clothing respecting the weather and river conditions.</td>
            ${generateEvaluationCells(points[54])}
        </tr>
        <tr>
            <td>Helmet, Personal Floating Device, quick release harness, footwear, knife, throw bag, locking carabiners, prussik loops, whistle, flip line, cow tail with locking carabiner, spare paddle, communication device, first aid kit.</td>
            ${generateEvaluationCells(points[55])}
        </tr>
        <tr>
            <td>Kayak: creek type, with extra floatability bags, full foot brace, handles in front and back.</td>
            ${generateEvaluationCells(points[56])}
        </tr>
        <tr>
            <td>Knowledge of hydrology and common hazards on the river: River morphology: Hazards are identified and the danger is understood (strainers, undercuts, reversals, sieves, eddy lines or seams, flooded rivers).</td>
            ${generateEvaluationCells(points[57])}
        </tr>
        <tr>
            <td>Artificial features: low head dam.</td>
            ${generateEvaluationCells(points[58])}
        </tr>
        <tr>
            <td>River hydrology: Mechanics of the eddies, current vectors, analysis of sections of the river in a curve.</td>
            ${generateEvaluationCells(points[59])}
        </tr>
        <tr>
            <td>The international river grading system is described: Range nature of water at each grade, degree of danger and/or difficulty at each grade.</td>
            ${generateEvaluationCells(points[60])}
        </tr>
        <tr>
            <td>Meteorology: Basics of weather forecast: Find and manage the information about weather forecast to avoid risks like rising water levels, climate or temperature changes.</td>
            ${generateEvaluationCells(points[61])}
        </tr>
        <tr>
            <td>Maps lecture: Be able to use a GPS, a compass.</td>
            ${generateEvaluationCells(points[62])}
        </tr>
        <tr>
            <td>Basics of orienteering: Be able to read a map and find out the relevant information to organize a rafting trip.</td>
            ${generateEvaluationCells(points[63])}
        </tr>
        <tr>
            <td>Basic legal knowledge: Rights and obligations, responsibility (civil and penal) for a SK.</td>
            ${generateEvaluationCells(points[64])}
        </tr>
        <tr>
            <td>Ethic of the guide: See WRF Ethic Rules.</td>
            ${generateEvaluationCells(points[65])}
        </tr>
        <tr>
            <td>Local fiscal aspects: Different worker statuses and the respective taxes.</td>
            ${generateEvaluationCells(points[66])}
        </tr>
        <tr>
            <td>Economic responsibilities of the worker status.</td>
            ${generateEvaluationCells(points[67])}
        </tr>
        <tr>
            <td>Demonstrate basic knowledge about the federal technical rules.</td>
            ${generateEvaluationCells(points[68])}
        </tr>
        <tr>
            <td>Expose a SK briefing clearly.</td>
            ${generateEvaluationCells(points[69])}
        </tr>
        <tr>
            <td>Explain the different techniques used to resolve foot entrapment and the management of foot entrapment.</td>
            ${generateEvaluationCells(points[70])}
        </tr>
        <tr>
            <td>Explain the solving steps for a wrapped raft.</td>
            ${generateEvaluationCells(points[71])}
        </tr>
        <tr>
            <td>Explain the key points to consider in the management of a flipped boat and what the different options are.</td>
            ${generateEvaluationCells(points[72])}
        </tr>
        <tr>
            <td>How to build a zip line.</td>
            ${generateEvaluationCells(points[73])}
        </tr>
        <tr>
            <td>First aid maneuvers.</td>
            ${generateEvaluationCells(points[74])}
        </tr>
        <tr>
            <td>What is the role of the SK?</td>
            ${generateEvaluationCells(points[75])}
        </tr>
        <tr>
            <td>River rope crossing.</td>
            ${generateEvaluationCells(points[76])}
        </tr>
        <tr>
            <td>Personal equipment and SK equipment.</td>
            ${generateEvaluationCells(points[77])}
        </tr>
    </tbody>
</table>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<div style="display: flex;justify-content: center;align-items: center;">
      <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
  </div>
  
  <p style="text-align: center;">
        The above evaluation of ${courseName} (consisted of 40 hours) and level granted, is completed by an instructor from the Costa Rica Rafting Federation, reviewed and approved by the President of the   Costa Rica Rafting Federation.
    </p>
  <p>
      Instructor of the Word Raft Federation Costa Rica:
  </p>
  <p>
      Name: Stanley Esquivel Mesen
  </p>
  <p>
      Date: ${document.evaluaciones[0].obtenido}
  </p>
  <p>
      Signature: ___________________________________________
  </p>
  <p>
      If you have any questions, please contact the President of the Costa Rica Rafting Federation at:
  </p>
  <p>
      Director of Education: Stanley Esquivel Mesen
  </p>
  <p>
      Email: sarapiquipaddless@gmail.com
  </p>
  <p>
      Phone Number: +(506) 6043- 7366 
  </p>
  <h2 style="text-align:center;">International Partners</h2>
  
  <div style="display: flex;justify-content: space-around;align-items: center;">
      <img src="data:image/png;base64,${base64Image2}" style="width: 15%;" alt="">
      <img src="data:image/png;base64,${base64Image}" style="width: 15%;" alt="">
      <img src="data:image/png;base64,${base64Image3}" style="width: 15%;" alt="">
  </div>
</body>

    
</html>`;

  return pdfContent;
};

// Helper function to generate evaluation cells
const generateEvaluationCells = (points) => {
  let result = `<td>${points == 1 ? 'X' : ''}</td>`;
  result += `<td>${points == 2 ? 'X' : ''}</td>`;
  result += `<td>${points == 3 ? 'X' : ''}</td>`;
  return result;
};



module.exports = {
  carnet,carnetWFA,evaluacionWFA,evaluacionACA,evaluationACASWR,evaluacionSK,carnetSWR,carnetACA
}
