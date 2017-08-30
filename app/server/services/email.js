var path = require('path');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var templatesDir = path.join(__dirname, '../templates');
var emailTemplates = require('email-templates');

var ROOT_URL = process.env.ROOT_URL;

var EMAIL_HOST = process.env.EMAIL_HOST;
var EMAIL_USER = process.env.EMAIL_USER;
var EMAIL_PASS = process.env.EMAIL_PASS;
var EMAIL_PORT = process.env.EMAIL_PORT;
var EMAIL_CONTACT = process.env.EMAIL_CONTACT;
var EMAIL_HEADER_IMAGE = process.env.EMAIL_HEADER_IMAGE;
if(EMAIL_HEADER_IMAGE.indexOf("https") == -1){
  EMAIL_HEADER_IMAGE = ROOT_URL + EMAIL_HEADER_IMAGE;
}

var NODE_ENV = process.env.NODE_ENV;

var options = {
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
};

var transporter = nodemailer.createTransport(smtpTransport(options));

var controller = {};

controller.transporter = transporter;

function sendOne(templateName, options, data, callback){

  if (NODE_ENV === "dev") {
    console.log(templateName);
    console.log(JSON.stringify(data, "", 2));
  }

  emailTemplates(templatesDir, function(err, template){
    if (err) {
      return callback(err);
    }

    data.emailHeaderImage = EMAIL_HEADER_IMAGE;
    template(templateName, data, function(err, html, text){
      if (err) {
        console.log('error')
        return callback(err);
      }

      transporter.sendMail({
        from: EMAIL_CONTACT,
        to: options.to,
        subject: options.subject,
        html: html,
        text: text
      }, function(err, info){
        if(callback){
          callback(err, info);
        }
      });
    });
  });
}

/*
* Send a status update email for admittance.
* @param  {[type]}   email    [description]
* @param  {Function} callback [description]
* @return {[type]}            [description]
*/
controller.sendAdmittanceEmail = function(user, callback) {

 var options = {
   to: user.email,
   subject: "[Junction Hackathon] - You have been admitted!"
 };
 var travelText;
 if (user.profile.AcceptedreimbursementClass === 'Rejected') {
   travelText = 'Unfortunately we have run out of travel reimbursements, so will not be able to grant you reimbursements this time.'
 } else {
   travelText = 'For travelling from ' + user.travelFromCountry + ' you will be granted X €'
 }

 var locals = {
   nickname: user.nickname,
   dashUrl: ROOT_URL,
   travelText: travelText
 };

 sendOne('email-admittance', options, locals, function(err, info){
   if (err){
     console.log(err);
   }
   if (info){
     console.log(info.message);
   }
   if (callback){
     callback(err, info);
   }
 });
};

/**
* Send a status update email for submission.
* @param  {[type]}   email    [description]
* @param  {[type]}   token    [description]
* @param  {Function} callback [description]
* @return {[type]}            [description]
*/
controller.sendConfirmationEmail = function(user, token, callback) {

 var options = {
   to: user.email,
   subject: "[Junction Hackathon] - You are confirmed!"
 };
 var travelText;
 if (user.needsReimbursement) {
   travelText = 'A reminder about your travel reimbursement: ' +
    '<br>For travelling from ' + user.travelFromCountry + ', you will be <br> granted X eur';
 }
 var accommodationText;
 if (user.applyAccommodation) {
   accommodationText = 'The free accommodation provided by Junction will be' +
   '<br>held at schools near the event venue. Be sure to bring necessary stuff' +
   '<br>like matress, sleeping bag and pillow.'
 }

 var locals = {
   nickname: user.nickname,
   userId: user.id,
   dashUrl: ROOT_URL,
   travelText: travelText,
   accommodationText: accommodationText
 };
 sendOne('email-confirmation', options, locals, function(err, info){
   if (err){
     console.log(err);
   }
   if (info){
     console.log(info.message);
   }
   if (callback){
     callback(err, info);
   }
 });
};

/**
* Send email if user declines invitation
* @param  {[type]}   email    [description]
* @param  {[type]}   token    [description]
* @param  {Function} callback [description]
* @return {[type]}            [description]
*/

// TODO: Change the email
controller.sendDeclinedEmail = function(user, token, callback) {

 var options = {
   to: user.email,
   subject: "[Junction Hackathon] - You have declined your invitation"
 };

 var locals = {
   nickname: user.nickname,
 };


 sendOne('email-decline', options, locals, function(err, info){
   if (err){
     console.log(err);
   }
   if (info){
     console.log(info.message);
   }
   if (callback){
     callback(err, info);
   }
 });
};


/**
 * Send a verification email to a user, with a verification token to enter.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
controller.sendVerificationEmail = function(user, token, callback) {

  var options = {
    to: user.email,
    subject: "[Junction Hackathon] - Verify your email"
  };

  var locals = {
    verifyUrl: ROOT_URL + '/verify/' + token,
    nickname: user.nickname
  };

  console.log(locals.verifyUrl);

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-verify', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });

};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordResetEmail = function(user, token, callback) {

  var options = {
    to: user.email,
    subject: "[Junction Hackathon] - Password reset requested!"
  };

  var locals = {
    actionUrl: ROOT_URL + '/reset/' + token,
    nickname: user.nickname
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-password-reset', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });

};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordChangedEmail = function(user, callback){

  var options = {
    to: user.email,
    subject: "[Junction Hackathon] - Your password has been changed!"
  };

  var locals = {
    nickname: user.nickname,
    dashUrl: ROOT_URL
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-password-changed', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });

};

module.exports = controller;
