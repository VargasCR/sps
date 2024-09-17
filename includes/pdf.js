const pdf = require('html-pdf-node');
//require('html-pdf-node');
const fs = require('fs');
const {} = require('../../includes/database');
const {} = require('./facturas');

const condiciones = {
  "01":"Contado",
  "02":"Crédito",
  "03":"Consignación",
  "04":"Apartado",
  "05":"Arrendamiento con opción de compra",
  "06":"Arrendamiento en función financiera",
  "07":"Cobro a favor de un tercero",
  "08":"Servicios prestados al Estado a crédito",
  "09":"Pago del servicios prestado al Estado",
  "10":"Venta a crédito en IVA hasta 90 días(Artículo 27, LIVA)",
  "11":"Pago de venta a crédito en IVA hasta 90 días(Artículo 27, LIVA)",
  "12":"Proforma",
  "99":"Otros"
}
const metodos = {
  "01":'Efectivo',
  "02":'Tarjeta',
  "03":'Sinpe',
  "04":'Cheque',
  "05":'Transferencia',
  "99":'Otros'
}
const createPDFBillH = async(obj, user, branch, xmlFactura, factura) => {
  let productos = obj.products;
  const nombreComercial = branch.nombreTienda;
  const cedulaComercial = branch.dni;
  const telComercial = branch.tel;
  const consecutivo1 = xmlFactura.clave.substring(0, 32);
  const consecutivo2 = xmlFactura.clave.substring(32, 50);
  let client = '';
  let clientDNI = '';
  let paymentMethod = JSON.parse(obj.paymentMethod);
  if(obj.clientdni != '') {
    client = xmlFactura.customer.name; 
    clientDNI = xmlFactura.customer.dni;
  }
  
  const totalResumen = xmlFactura.totalResumen;
  let condicion = "";
  const vendedor = user.dni;

  paymentMethod.forEach(element => {
    element.nombre = metodos[element.cod];
  });

  for (const clave in condiciones) {
    if (condiciones.hasOwnProperty(clave)) {
      if(obj.condicion == clave) {
        condicion = condiciones[clave];
      }
    }
  }
  
  productos.forEach(element => {
    if(element.nombre.length > 16) {
      element.nombre = element.nombre.substring(0, 16);
    }
    element.totalFinal = parseInt(element.precioUnitario) * parseInt(element.cantidad);
  });
  
  let info = {};
  let document = {};
  if(obj.isCredit == '1' || obj.isCredit == '2') {
    //const htmlTemplate = fs.readFileSync('./includes/pdf/bill-print-hacienda-abono.html', 'utf8');
    var options = {
        height: "30cm",
        width: "6cm",
        border: "0mm",
    };
    const now = new Date();
    const fechaActual = now.toLocaleDateString();
    const horaActual = now.toLocaleTimeString();
    let totalPaid = 0;
    info = {
      productos: productos,
      nombreComercial: nombreComercial,
      cedulaComercial: cedulaComercial,
      telComercial: telComercial,
      consecutivo1: consecutivo1,
      consecutivo2: consecutivo2,
      fecha: fechaActual,
      hora: horaActual,
      client: client,
      clientDNI: clientDNI,
      condicion: condicion,
      totalResumen:totalResumen,
      vendedor:vendedor,
      isclient:false,
      paymentMethod: paymentMethod,
      factura:factura
    };

    if(obj.clientdni != '') {
      info.isclient = true;
    }
    const documentPDF = billPrintHaciendaAbono(info);
    const file = { content: documentPDF };
    await pdf.generatePdf(file, options).then(pdfBuffer => {
      let path = '';
      checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf');
      if(obj.condicion == '02') {
        checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/creditos');
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/creditos/'+xmlFactura.clave+'.pdf';
      } else if(obj.condicion == '04') {
        checkFolder('./database/'+user.dni+'/'+data.folder)+'pdf/apartados';
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/apartados/'+xmlFactura.clave+'.pdf';
      } else {
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/'+xmlFactura.clave+'.pdf';
      }
      fs.writeFileSync(path, pdfBuffer);
      //console.log(`PDF guardado en: ${path}`);
    }).catch(error => {
      console.error('Error generando el PDF:', error);
    });
    return info;
  } else if(factura == 'x') {
    //const htmlTemplate = fs.readFileSync('./includes/pdf/nota-credito.html', 'utf8');
    var options = {
        height: "30cm",
        width: "6cm",
        border: "0mm",
    };
    const now = new Date();
    const fechaActual = now.toLocaleDateString();
    const horaActual = now.toLocaleTimeString();
    info = {
      productos: productos,
      nombreComercial: nombreComercial,
      cedulaComercial: cedulaComercial,
      telComercial: telComercial,
      consecutivo1: consecutivo1,
      consecutivo2: consecutivo2,
      fecha: fechaActual,
      hora: horaActual,
      client: client,
      clientDNI: clientDNI,
      condicion: condicion,
      totalResumen:totalResumen,
      vendedor:vendedor,
      isclient:false,
      paymentMethod: paymentMethod,
      oldconsecutivo1:obj.consecutivo.substr(0,32),
      oldconsecutivo2:obj.consecutivo.substr(33,50),
    };
  
    const documentPDF = notaCredito(info);
    const file = { content: documentPDF };
    await pdf.generatePdf(file, options).then(pdfBuffer => {
      let path = '';
      checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf');
      if(obj.isCredit == '1') {
        checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf');
      path = './database/'+user.dni+'/'+branch.folder+'/pdf/'+xmlFactura.clave+'.pdf';
      } else if(obj.isCredit == '2') {
        checkFolder('./database/'+user.dni+'/'+branch.folder)+'pdf';
      path = './database/'+user.dni+'/'+branch.folder+'/pdf/'+xmlFactura.clave+'.pdf';
      } else {
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/'+xmlFactura.clave+'.pdf';
      }
      fs.writeFileSync(path, pdfBuffer);
      //console.log(`PDF guardado en: ${path}`);
    }).catch(error => {
      console.error('Error generando el PDF:', error);
    });
    return info;
  } else {
    var options = {
        height: "30cm",
        width: "6cm",
        border: "0mm"
    };
    const now = new Date();
    const fechaActual = now.toLocaleDateString();
    const horaActual = now.toLocaleTimeString();
    info = {
      productos: productos,
      nombreComercial: nombreComercial,
      cedulaComercial: cedulaComercial,
      telComercial: telComercial,
      consecutivo1: consecutivo1,
      consecutivo2: consecutivo2,
      fecha: fechaActual,
      hora: horaActual,
      client: client,
      clientDNI: clientDNI,
      condicion: condicion,
      totalResumen:totalResumen,
      vendedor:vendedor,
      isclient:false,
      paymentMethod: paymentMethod
    };
    if(obj.clientdni != '') {
      info.isclient = true;
    }
    const documentPDF = billPrintHacienda(info);
    const file = { content: documentPDF };
    await pdf.generatePdf(file, options).then(pdfBuffer => {
      let path = '';
      checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf');
      if(obj.condicion == '02') {
        checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/creditos');
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/creditos/'+xmlFactura.clave+'.pdf';
      } else if(obj.condicion == '04') {
        checkFolder('./database/'+user.dni+'/'+data.folder)+'pdf/apartados';
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/apartados/'+xmlFactura.clave+'.pdf';
      } else {
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/'+xmlFactura.clave+'.pdf';
      }
      fs.writeFileSync(path, pdfBuffer);
      //console.log(`PDF guardado en: ${path}`);
    }).catch(error => {
      console.error('Error generando el PDF:', error);
    });
    return info;
  }
}


const guardarCierre = async(factura,user,branch) => {
  
  var options = {
    height: "30cm",
    width: "6cm",
    border: "0mm",
  };
  await checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf');
  await checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/cierres');
  //const htmlTemplate = fs.readFileSync('./includes/pdf/cierre.html', 'utf8');
  info = {
    nombreComercial:factura.nombreComercial,
    cedulaComercial:factura.cedulaComercial,
    telComercial:factura.telComercial,
    aperturaF:factura.aperturaF,
    cierreF:factura.cierreF,
    aperturaH:factura.aperturaH,
    cierreH:factura.cierreH,
    consecutivo:factura.consecutivo,
    montoApertura:factura.montoApertura,
    facturaCierre:factura.facturaCierre,
    efectivoA: factura.efectivoA,
    tarjetaA: factura.tarjetaA,
    sinpeA: factura.sinpeA,
    chequeA: factura.chequeA,
    transferenciaA: factura.transferenciaA,
    otrosA: factura.otrosA,
    impuestos: factura.impuestos,
    subtotal: factura.subtotal,
    totalApertura:factura.totalApertura,
    efectivoN: factura.efectivoN,
    tarjetaN: factura.tarjetaN,
    sinpeN: factura.sinpeN,
    chequeN: factura.chequeN,
    transferenciaN: factura.transferenciaN,
    otrosN: factura.otrosN,
    montoAcuse: factura.montoAcuse,
    montoNoAcuse: factura.montoNoAcuse,
    efectivo: factura.efectivo,
    tarjeta: factura.tarjeta,
    sinpe: factura.sinpe,
    cheque: factura.cheque,
    transferencia: factura.transferencia,
    otros: factura.otros,
    montoFinal: factura.montoFinal,
    cajero:factura.cajero,
    deleted:factura.deleted,
    expenseTotal:factura.expenseTotal,
    expenses:factura.expenses,
    expenseEfectivo:factura.expenseEfectivo
  };
  
  const documentPDF = cierre(info);
  const file = { content: documentPDF };
  pdf.generatePdf(file, options).then(pdfBuffer => {
    let path = '';
    path = './database/'+user.dni+'/'+branch.folder+'/pdf/cierres/'+factura.consecutivo+'.pdf';
    fs.writeFileSync(path, pdfBuffer);
    //console.log(`PDF guardado en: ${path}`);
  }).catch(error => {
    console.error('Error generando el PDF:', error);
  });
  return info;
}






const reporteSaldoFacturas = async(info,userDni,branchFolder) => {
  var options = {
    height: "30cm",
    width: "6cm",
    border: "0mm",
  };
  await checkFolder('./database/'+userDni+'/'+branchFolder+'/pdf');
  await checkFolder('./database/'+userDni+'/'+branchFolder+'/pdf/reportes');
  const documentPDF = reporteSaldo(info);
  //return
  const file = { content: documentPDF };
  pdf.generatePdf(file, options).then(pdfBuffer => {
    let path = '';
    path = './database/'+userDni+'/'+branchFolder+'/pdf/reportes/'+info.customer.dni+'-'+info.condicion+'.pdf';
    fs.writeFileSync(path, pdfBuffer);
    //console.log(`PDF guardado en: ${path}`);
  }).catch(error => {
    console.error('Error generando el PDF:', error);
  });
  return true;
}


const reporteCredito = async(factura,user,branch) => {
  
  var options = {
    height: "30cm",
    width: "6cm",
    border: "0mm",
  };
  await checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf');
  await checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/cierres');
  //const htmlTemplate = fs.readFileSync('./includes/pdf/cierre.html', 'utf8');
  info = {
    nombreComercial:factura.nombreComercial,
    cedulaComercial:factura.cedulaComercial,
    telComercial:factura.telComercial,
    aperturaF:factura.aperturaF,
    cierreF:factura.cierreF,
    aperturaH:factura.aperturaH,
    cierreH:factura.cierreH,
    consecutivo:factura.consecutivo,
    montoApertura:factura.montoApertura,
    facturaCierre:factura.facturaCierre,
    efectivoA: factura.efectivoA,
    tarjetaA: factura.tarjetaA,
    sinpeA: factura.sinpeA,
    chequeA: factura.chequeA,
    transferenciaA: factura.transferenciaA,
    otrosA: factura.otrosA,
    impuestos: factura.impuestos,
    subtotal: factura.subtotal,
    totalApertura:factura.totalApertura,
    efectivoN: factura.efectivoN,
    tarjetaN: factura.tarjetaN,
    sinpeN: factura.sinpeN,
    chequeN: factura.chequeN,
    transferenciaN: factura.transferenciaN,
    otrosN: factura.otrosN,
    montoAcuse: factura.montoAcuse,
    montoNoAcuse: factura.montoNoAcuse,
    efectivo: factura.efectivo,
    tarjeta: factura.tarjeta,
    sinpe: factura.sinpe,
    cheque: factura.cheque,
    transferencia: factura.transferencia,
    otros: factura.otros,
    montoFinal: factura.montoFinal,
    cajero:factura.cajero,
    deleted:factura.deleted
  };
  
  const documentPDF = cierre(info);
  const file = { content: documentPDF };
  pdf.generatePdf(file, options).then(pdfBuffer => {
    let path = '';
    path = './database/'+user.dni+'/'+branch.folder+'/pdf/cierres/'+factura.consecutivo+'.pdf';
    fs.writeFileSync(path, pdfBuffer);
    //console.log(`PDF guardado en: ${path}`);
  }).catch(error => {
    console.error('Error generando el PDF:', error);
  });
  return info;
}










const createPDFBillNoH = async(obj, user, branch,conse,factura) => {
  let productos = obj.products;
  const nombreComercial = branch.nombreTienda;
  const cedulaComercial = branch.dni;
  const telComercial = branch.tel;
  const consecutivo = conse;
  const totalResumen = obj.totalResumen;
  let condicion = "";
  const vendedor = user.dni;
  for (const clave in condiciones) {
    if (condiciones.hasOwnProperty(clave)) {
      if(obj.condicion == clave) {
        condicion = condiciones[clave];
      }
    }
  }

  let paymentMethod = JSON.parse(obj.paymentMethod);
  paymentMethod.forEach(element => {
    element.nombre = metodos[element.cod];
  });
  productos.forEach(element => {
    if(element.nombre.length > 16) {
      element.nombre = element.nombre.substring(0, 16);
    }
    element.totalFinal = parseInt(element.precioUnitario) * parseInt(element.cantidad);
  });

  var options = {
    height: "30cm",
    width: "6cm",
    border: "0mm",
  };

  const now = new Date();
  const fechaActual = now.toLocaleDateString();
  const horaActual = now.toLocaleTimeString();
  
  let customer = null;
  let info = {};
  let document = {};

  const medioPago = JSON.parse(obj.paymentMethod);
  let totalPaid = 0;
  medioPago.forEach(element => {
    totalPaid += parseInt(element.total);
  });
  
  if(obj.isCredit == '1') {
    //const htmlTemplate = fs.readFileSync('./includes/pdf/bill-print-noh-abono.html', 'utf8');
    
    info = {
      productos: productos,
      nombreComercial: nombreComercial,
      cedulaComercial: cedulaComercial,
      telComercial: telComercial,
      consecutivo: consecutivo,
      fecha: fechaActual,
      hora: horaActual,
      condicion: condicion,
      totalResumen:totalPaid,
      vendedor:vendedor,
      isclient:true,
      plazo: '0',
      credito: false,
      paymentMethod:paymentMethod,
      factura:factura
    };
    if(obj.clientdni != '') {
      let customersText = await findBD(user.dni,branch.folder,'customers.json');
      const customers = JSON.parse(customersText);
      const customer = customers.filter(item => item.dni == obj.clientdni)[0];
      info.isclient = true;
      info.clientName = customer.name;
      info.clientDni = customer.dni;
      info.plazo = customer.days;
      info.credito = customer.credito;
    }
    const documentPDF = billPrintNohAbono(info);
    const file = { content: documentPDF };
    pdf.generatePdf(file, options).then(pdfBuffer => {
      let path = '';
      checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf');
      if(obj.condicion == '02') {
        checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/creditos');
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/creditos/'+consecutivo+'.pdf';
      } else if(obj.condicion == '04') {
        checkFolder('./database/'+user.dni+'/'+branch.folder)+'/pdf/apartados';
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/apartados/'+consecutivo+'.pdf';
      } else {
          checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/noh');
          path = './database/'+user.dni+'/'+branch.folder+'/pdf/noh/'+consecutivo+'.pdf';
      }
      fs.writeFileSync(path, pdfBuffer);
      //console.log(`PDF guardado en: ${path}`);
    }).catch(error => {
      console.error('Error generando el PDF:', error);
    });
    return info;
    
  } else if(obj.isCredit == '2') {
    
    //const htmlTemplate = fs.readFileSync('./includes/pdf/bill-print-noh-abono.html', 'utf8');
    info = {
      productos: productos,
      nombreComercial: nombreComercial,
      cedulaComercial: cedulaComercial,
      telComercial: telComercial,
      consecutivo: consecutivo,
      fecha: fechaActual,
      hora: horaActual,
      condicion: condicion,
      totalResumen:totalPaid,
      vendedor:vendedor,
      isclient:true,
      plazo: '30',
      credito: false,
      paymentMethod:paymentMethod,
      factura:factura
    };
    if(obj.clientdni != '') {
      let customersText = await findBD(user.dni,branch.folder,'customers.json');
      const customers = JSON.parse(customersText);
      const customer = customers.filter(item => item.dni == obj.clientdni)[0];
      info.isclient = true;
      info.clientName = customer.name;
      info.clientDni = customer.dni;
      info.plazo = customer.days;
      info.credito = customer.credito;
    }
    const documentPDF = billPrintNohAbono(info);
    const file = { content: documentPDF };
    pdf.generatePdf(file, options).then(pdfBuffer => {
      let path = '';
      checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf');
      if(obj.condicion == '02') {
        checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/creditos');
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/creditos/'+consecutivo+'.pdf';
      } else if(obj.condicion == '04') {
        checkFolder('./database/'+user.dni+'/'+branch.folder)+'/pdf/apartados';
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/apartados/'+consecutivo+'.pdf';
      } else {
          checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/noh');
          path = './database/'+user.dni+'/'+branch.folder+'/pdf/noh/'+consecutivo+'.pdf';
      }
      fs.writeFileSync(path, pdfBuffer);
      //console.log(`PDF guardado en: ${path}`);
    }).catch(error => {
      console.error('Error generando el PDF:', error);
    });
    return info;

  } else {
    //const htmlTemplate = fs.readFileSync('./includes/pdf/bill-print-noh.html', 'utf8');
    info = {
      productos: productos,
      nombreComercial: nombreComercial,
      cedulaComercial: cedulaComercial,
      telComercial: telComercial,
      consecutivo: consecutivo,
      fecha: fechaActual,
      hora: horaActual,
      condicion: condicion,
      totalResumen:totalResumen,
      vendedor:vendedor,
      isclient:false,
      plazo: '0',
      credito: false,
      paymentMethod:paymentMethod
    };
    if(obj.clientdni != '') {
      let customersText = await findBD(user.dni,branch.folder,'customers.json');
      const customers = JSON.parse(customersText);
      const customer = customers.filter(item => item.dni == obj.clientdni)[0];
      info.isclient = true;
      info.client = customer.name;
      info.clientDNI = customer.dni;
      if(obj.condicion == '02') {
        info.plazo = customer.days;
        info.credito = customer.credito;
        info.paymentMethod = false;
      } else if(obj.condicion == '04') {
        info.plazo = '0';
        info.credito = false;
      } else if(obj.condicion == '12') {
        info.paymentMethod = false;
        info.plazo = '0';
        info.credito = false;
      } else {
        info.plazo = '0';
        info.credito = false;
      }
    }
    const documentPDF = billPrintNoh(info);
    const file = { content: documentPDF };
    pdf.generatePdf(file, options).then(pdfBuffer => {
      let path = '';
      checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf');
      if(obj.condicion == '02') {
        checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/creditos');
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/creditos/'+consecutivo+'.pdf';
      } else if(obj.condicion == '04') {
        checkFolder('./database/'+user.dni+'/'+branch.folder)+'/pdf/apartados';
        path = './database/'+user.dni+'/'+branch.folder+'/pdf/apartados/'+consecutivo+'.pdf';
      } else {
          checkFolder('./database/'+user.dni+'/'+branch.folder+'/pdf/noh');
          path = './database/'+user.dni+'/'+branch.folder+'/pdf/noh/'+consecutivo+'.pdf';
      }
      fs.writeFileSync(path, pdfBuffer);
      //console.log(`PDF guardado en: ${path}`);
    }).catch(error => {
      console.error('Error generando el PDF:', error);
    });
    
    //console.log('infox');
    //console.log('infox');
    //console.log('infox');
    //console.log('infox');
    //console.log(info);
    return info;
  }
}

module.exports = {
  createPDFBillH,createPDFBillNoH,guardarCierre,reporteCredito,
  reporteSaldoFacturas
}