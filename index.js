/*** Mathematica2 Z-Way HA module *******************************************

Version: 0.0.4
(c) 2016 / 2021
-----------------------------------------------------------------------------
Author: Pieter E. Zanstra, mod. by M.Pruefer
Description:
This module allows the user to create a multilevel sensor, which value is derived
from one or two user selectable sensors, and up to two user specified fixed values
The user can supply any valid mathematical expression to combine these inputs.

 ******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------

function Mathematica2(id, controller) {
	// Call superconstructor first (AutomationModule)
	Mathematica2.super_.call(this, id, controller);
}

inherits(Mathematica2, AutomationModule);

_module = Mathematica2;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

Mathematica2.prototype.init = function (config) {
	Mathematica2.super_.prototype.init.call(this, config);

	var self = this, icon = "";

	this.vDev = self.controller.devices.create({
			deviceId : "Mathematica2_" + this.id,
			defaults : {
				deviceType : "sensorMultilevel",
				metrics : {
					probeTitle : self.config.Title,
					icon: icon // here to allow changing icon to custom one
				}
			},
			overlay : {
				metrics : {
					scaleTitle : self.config.scaleTitle,
					title : self.config.Title
				}
			},
			moduleId : this.id
		});

//  Following code is a replacement for the 'timed' call to fetch equation. It should fix
//  the problem of not initialised variables at start up.

	this.controller.devices.on(self.config.sensor1, 'change:metrics:level', function() { 
		self.fetchEquation(self);
	});
	this.controller.devices.on(self.config.sensor2, 'change:metrics:level', function() {
		self.fetchEquation(self);
	});

};

Mathematica2.prototype.stop = function () {
	Mathematica2.super_.prototype.stop.call(this);

	if (this.timer) {
		clearInterval(this.timer);
	}

	if (this.vDev) {
		this.controller.devices.remove(this.vDev.id);
		this.vDev = null;
	}
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

Mathematica2.prototype.fetchEquation = function (instance) {
	var self = instance,
	result = 0;

	var calculation = self.config.formula;
	var metric1 = "metrics:" + self.config.metric1;
	var metric2 = "metrics:" + self.config.metric2;
	var a = controller.devices.get(self.config.sensor1).get(metric1);
	try {
	    var b = controller.devices.get(self.config.sensor2).get(metric2);
	}
	catch(err){
	    var b = 0;
	}

	result = eval(calculation);

	self.vDev.set("metrics:level", result);
	self.vDev.set("metrics:icon", "/ZAutomation/api/v1/load/modulemedia/Mathematica2/icon.png");
};
