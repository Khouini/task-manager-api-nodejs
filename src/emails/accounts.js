const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendWelcomeEmail(name, email) {
  sgMail.send({
    to: email,
    from: 'medyacine.khouini@esprit.tn',
    subject: 'Welcome to the app!',
    text: `Thanks for joining us ${name}!`,
  });
}
function cancelationEmail(name, email) {
  sgMail.send({
    to: email,
    from: 'medyacine.khouini@esprit.tn',
    subject: 'Account cancelation',
    text: `Mr ${name}, why does you quit us?`,
  });
}

module.exports = { sendWelcomeEmail, cancelationEmail };
