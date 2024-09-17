var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'atlanticatienda33@gmail.com',
    pass: 'rwvb gulp aekc bpkq' // O la contraseña de aplicación si la tienes configurada
  }
});

const Email = async (text, fromEmail) => {
  let mailOptions = {};
  const to = 'sarapiquipaddless@gmail.com'; // Destinatario
  //const to = 'jvjaviervargas2252@gmail.com'; // Destinatario
  const subject = 'Correo Recibido';
  console.log(text)
  let message = `<p>${text}</p>`
  message += `<a href="mailto:${fromEmail}">Send mail</a>`
  // El "from" es el nombre del remitente pero sigue usando el correo autenticado
  mailOptions = {
    from: `"Sarapiqui Paddles Sports Email" <sarapiquipaddless@gmail.com>`, // Mostrar el nombre del remitente pero usar la cuenta de la tienda
    replyTo: fromEmail, // Si el destinatario responde, irá al correo del remitente
    to: to,
    subject: subject,
    html: message
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.error('Error sending email:', error);
        reject(false);
      } else {
        console.log('Email sent successfully:', info.response);
        resolve(true);
      }
    });
  });
};

module.exports = {
  Email,
};
