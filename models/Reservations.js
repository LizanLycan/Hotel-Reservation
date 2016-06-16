var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Reservation Model
 * =============
 */

var Reservation = new keystone.List('Reservation', {
	nocreate: true,
	//noedit: true,
});

Reservation.add({
	client: { type: Types.Relationship, ref: 'User', initial: true, index: true},
	name: { type: Types.Name/*, required: true*/ },
	email: { type: Types.Email/*, required: true*/ },
	phone: { type: String },
	dateIn: { type: Types.Datetime, index:true, required: true },
	dateOut: { type: Types.Datetime, index: true, require: true },
	roomCategory: { type: Types.Select, options: [
		{ value: 'Sencillo', label: 'Habitacion sencilla con cama individual' },
		{ value: 'Doble', label: 'Habitacion sencilla con dos camas individuales' },
		{ value: 'Matrimonial', label: 'Habitacion sencilla con cama Matrimonial' },
		{ value: 'Triple', label: 'Habitacion sencilla con cama Matrimonial y una individual'},
	] },
	comment: { type: Types.Markdown},
	createdAt: { type: Date, default: Date.now }
});

Reservation.schema.pre('save', function(next) {
	this.wasNew = this.isNew;
	next();
});

Reservation.schema.post('save', function() {
	if (this.wasNew) {
		this.sendNotificationEmail();
	}
});

Reservation.schema.methods.sendNotificationEmail = function(callback) {

	if ('function' !== typeof callback) {
		callback = function() {};
	}

	var Reservation = this;

	keystone.list('User').model.find().where('isAdmin', true).exec(function(err, admins) {

		if (err) return callback(err);

    new keystone.Email({
        
        templateName: 'Reservation-notification'
      }).send({
        to: admins,
        from: {
          name: 'My Site',
          email: 'contact@my-site.com'
        },
        subject: 'New Reservation for My Site',
        enquiry: Reservation
      }, callback);
    });

};

Reservation.defaultSort = '-createdAt';
Reservation.defaultColumns = 'client|20%, name, roomCategory, createdAt';
Reservation.register();
