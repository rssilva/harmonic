var Parser = require('./parser');
var Promise = require('promise');

var parser = new Parser();
module.exports = {

	init : function () {
		return new Promise(function (resolve, reject) {
			parser.start()
			.then(parser.clean)
			.then(parser.getConfig)
			.then(parser.createPublicFolder)
			.then(parser.compileStylus)
			.then(parser.generatePages)
			.then(parser.getFiles)
			.then(parser.generatePosts)
			.then(parser.generateIndex)
			.then(parser.generateTagsPages)
			.then(parser.copyResources)
			.then(resolve)
			.catch(function (e) {
				console.log(e);
			});
		});
	}
}
