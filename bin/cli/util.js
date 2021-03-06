var fs = require('fs');
var path = './src/posts/';
var Promise = require('promise');
var staticServer = require('node-static');
var co = require('co');
var prompt = require('co-prompt');
var confirm = prompt.confirm;
var _ = require('underscore');
var ncp = require('ncp').ncp;
var rootdir = GLOBAL.rootdir;

module.exports = {

	init : function (p) {
		var sitePath = p,
			skeletonPath = rootdir + '/bin/skeleton',
			copySkeleton = function () {
				console.log(skeletonPath, sitePath);
				ncp(skeletonPath, sitePath, function (err) {
					if (err) {
						console.log(err);
						return;
					}
					console.log('Harmonic skeleton started at: ' + sitePath);
				});
			}

		fs.exists(sitePath, function(exists) {
			if(!exists) {
				fs.mkdirSync(sitePath, 0766);
			}
			copySkeleton();
		});
	},

	cli_color : function () {
		var clc = require('cli-color');
		return {
			info : clc.green,
			error : clc.red,
			warn : clc.yellowBright,
			message : clc.bgBlack.yellow
		}
	},

	config : function () {
		var clc = this.cli_color();

		co(function *() {
			console.log(clc.message("This guide will help you to create your Harmonic configuration file\nJust hit enter if you are ok with the default values.\n\n"));

			var templateObj = {
			    "name": "Awesome website",
			    "title": "My awesome static website",
			    "domain": "http://awesome.com",
			    "subtitle": "Powered by Harmonic",
			    "author": "Jaydson",
			    "description": "This is the description",
			    "bio": "Thats me",
			    "template": "default",
			    "posts_permalink" : ":year/:month/:title",
			    "pages_permalink" : "pages/:title"
			};

			var config = {
				name : (yield prompt(clc.message('Site name: (' + templateObj.name + ')'))) || templateObj.name,
				title : (yield prompt(clc.message('Title: (' + templateObj.title + ')'))) || templateObj.title,
				subtitle : (yield prompt(clc.message('Subtitle: (' + templateObj.subtitle + ')'))) || templateObj.subtitle,
				description : (yield prompt(clc.message('Description: (' + templateObj.description + ')'))) || templateObj.description,
				author : (yield prompt(clc.message('Author: (' + templateObj.author + ')'))) || templateObj.author,
				bio : (yield prompt(clc.message('Author bio: (' + templateObj.bio + ')'))) || templateObj.bio,
				template : (yield prompt(clc.message('Template: (' + templateObj.template + ')'))) || templateObj.template
			}

			/* create the configuration file */
			fs.writeFile('./harmonic.json', JSON.stringify(_.extend(templateObj, config), null, 4), function (err) {
				if (err) throw err;
				console.log(clc.info('Config file was successefuly created/updated'));
			});
			
			process.stdin.pause();

		})();
	},

	new_post : function (title) {
		var clc = this.cli_color();
		return new Promise(function (resolve, reject) {
			var template = '<!--\n' +
								'layout: post\n' +
								'title: ' + title + '\n'+
								'date: ' + new Date().toJSON() + '\n' +
								'comments: true\n' +
								'published: true\n' +
								'keywords:\n' +
								'description:\n' +
								'categories:\n' +
							'-->';
			var str = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-*|-*$/g, '').toLowerCase();
			var filename = path + str + '.md';

			/* create a new post */
			fs.writeFile(filename, template, function (err) {
				if (err) throw err;
				resolve(clc.info('Post "' + title + '" was successefuly created. File generated at ' + filename));
			});
		});
	},

	run : function (port) {
		var clc = this.cli_color();
		var file = new staticServer.Server('./public');
		console.log(clc.info('Harmonic site is running on http://localhost:' + port));
		require('http').createServer(function (request, response) {
			request.addListener('end', function () {
				file.serve(request, response);
			}).resume();
		}).listen(port);
	}
}