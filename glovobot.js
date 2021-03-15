const https = require('https');
const config = require('./config.js');
const fs = require('fs');

const HOST = 'api.glovoapp.com';
const API_PATH = '/';
const API_PATH_V3 = '/v3/';
const PORT = 443;

var user = {}

function setup() {
	fs.promises.mkdir('data', { recursive: true }).catch(console.error);
}

function login(email, password) {
	const data = JSON.stringify({
		username: email,
		password: password,
		termsAndConditionsChecked: true,
		grantType: "PASSWORD"
	});

	const options = {
		hostname: HOST,
		port: PORT,
		path: API_PATH + 'oauth/token',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length
		}
	}

	const req = https.request(options, res => {
		res.on('data', d => {
			var json = JSON.parse(d.toString());

			user.authToken = json.accessToken;

			fs.writeFile('data/token.txt', user.authToken, function(err, data) {
				if (err) {
					return console.error(err);
				}
			});
		});
	});

	req.on('error', error => {
		console.error(error);
	});

	req.write(data);
	req.end();
}

function getFreeSlots() {
	const data = JSON.stringify({
		accessToken: user.authToken
	});
}

function start() {
	login(config.email, config.password);
	getFreeSlots();
}

setup();
start();
