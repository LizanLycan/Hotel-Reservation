var keystone = require('keystone');
var Reservation = keystone.list('Reservation');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'reservation';
	locals.roomCategory = Reservation.fields.roomCategory.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.ReservationSubmitted = false;

	// On POST requests, add the Reservation item to the database
	view.on('post', { action: 'reservation' }, function (next) {

		var newReservation = new Reservation.model();
		var updater = newReservation.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, phone, roomCategory, comment',
			errorMessage: 'There was a problem submitting your Reservation:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.ReservationSubmitted = true;
			}
			next();
		});
	});

	view.render('reservation');
};
