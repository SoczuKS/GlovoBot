const https = require('https');
const config = require('./config.js');
const fs = require('fs');

var user = {}

function setup() {
	fs.promises.mkdir(dataDir, { recursive: true }).catch(console.error);
}

function refreshToken() {
	const data = JSON.stringify({
		refreshToken: user.authToken
	});

	const options = {
		hostname: host,
		port: port,
		path: apiPath + 'oauth/refresh',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length
		}
	}

	const req = https.request(options, res => {
		res.on('data', d => {
			var json = JSON.parse(d.toString());

			console.log(json);
		});
	});

	req.on('error', err => {
		console.error(err)
	});

	req.write(data);
	req.end();
}

function getToken() {
	fs.access(dataDir + tokenFile, fs.F_OK, (err) => {
		if (err) {
			login(config.email, config.password);
			return;
		}

		fs.readFile(dataDir + tokenFile, 'utf8', (err, data) => {
			if (err)
				return;

			user.authToken = data;
			refreshToken();
		});
	});
}

function login() {
	const data = JSON.stringify({
		username: config.email,
		password: config.password,
		termsAndConditionsChecked: true,
		grantType: 'PASSWORD'
	});

	const options = {
		hostname: host,
		port: port,
		path: apiPath + 'oauth/token',
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

	req.on('error', err => {
		console.error(err);
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
	getToken();
	getFreeSlots();
}

setup();
start();
