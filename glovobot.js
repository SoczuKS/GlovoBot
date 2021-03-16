const https = require('https');
const config = require('./config.js');
const fs = require('fs');

const HOST = 'api.glovoapp.com';
const API_PATH = '/';
const API_PATH_V3 = '/v3/';
const PORT = 443;

const DATA_DIR = 'data/';
const TOKEN_FILE = 'token.txt';

var user = {}

function setup() {
	fs.promises.mkdir(DATA_DIR, { recursive: true }).catch(console.error);
}

function getChallenges() {
	
}

function refreshToken() {
	const data = JSON.stringify({
		refreshToken: user.authToken
	});

	const options = {
		hostname: HOST,
		port: PORT,
		path: API_PATH + 'oauth/refresh',
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
	fs.access(DATA_DIR + TOKEN_FILE, fs.F_OK, (err) => {
		if (err) {
			login(config.email, config.password);
			return;
		}

		fs.readFile(DATA_DIR + TOKEN_FILE, 'utf8', (err, data) => {
			if (err)
				return;

			user.authToken = data;
			refreshToken();
		});
	});
}

function login(email, password) {
	const data = JSON.stringify({
		username: email,
		password: password,
		termsAndConditionsChecked: true,
		grantType: 'PASSWORD'
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
