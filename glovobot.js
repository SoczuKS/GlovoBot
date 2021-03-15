const https = require('https');
const config = require('./config.js');

const HOST = 'api.glovoapp.com';
const API_PATH = '/';
const API_PATH_V3 = '/v3/';
const PORT = 443;

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
		console.log(`statusCode: ${res.statusCode}`)

		res.on('data', d => {
			console.log(d.toString());
		});
	});

	req.on('error', error => {
		console.error(error);
	});

	req.write(data);
	req.end();
}

function start() {
	login(config.email, config.password);
}

start();
