import fs from 'fs';

/**
 * Attempts to delete a file, with error catching.
 * @param {string} path - file location.
 * @returns {Promise<boolean,NodeJS.ErrnoException>}
 * @
 */
export const deleteFile = (path: string) => new Promise((res, rej) => {

	fs.unlink(path, (err) => {
		err ? rej(err) : res(true);
	});

});

/**
 * Determines if file exists at path, without throwing exceptions.
 * @param path
 * @returns {Promise<boolean>}
 */
export const exists = (path: string): Promise<boolean> => new Promise((res) => {

	fs.access(path, (err) => {
		res(!err);
	});

});


/**
 * @function
 * @param {string} path
 * @param {?Object|string} [options=null] Encoding used as the encoding of the result. If not provided, `'utf8'` is used.
 * @returns {Promise<string[],NodeJS.ErrnoException>}
 */
const readdir = fs.promises.readdir;

/**
 * @function
 * Read a list of names of all files at the given path, excluding directories.
 * @param {string} path
 * @returns {Promise<string[], NodeJS.ErrnoException>}
 */
export const readfiles = (path: string) => new Promise<string[]>((res, rej) => {

	if (path.charAt(path.length - 1) != '/') path += '/'; // might be unncessary now?

	readdir(path, { withFileTypes: true }).then(

		files => {

			const found = [];

			for (let i = files.length - 1; i >= 0; i--) {
				if (files[i].isFile()) found.push(files[i].name);
			}
			res(found);

		},
		err => rej(err)
	);


});

/**
 * @function
 * Attempt to create a directory.
 * Directory already existing is not considered an error.
 * @param {string} path
 * @returns {Promise}
 */
export const mkdir = (path: string) => {

	return fs.promises.stat(path).then(

		stat => {

			if (stat.isDirectory()) return;
			else throw new Error('File exists and is not a directory.');

		},
		() => {

			// file does not exist. this is intended.
			return fs.promises.mkdir(path, { recursive: true });
		}
	);

};

/**
 * @param {string} path
 * @returns {Promise<*,NodeJS.ErrnoException>}
 */
export const readFile = fs.promises.readFile;

/**
 * @param {string} path
 * @returns {Promise<Object,Error>}
 */
export const readJSON = (path: string) => new Promise((res, rej) => {

	fs.readFile(path, 'utf8', (err, data) => {

		if (err) rej(err);
		else if (data === undefined || data === null) rej('File null.');
		else {

			if (data === '') res(null);

			else {

				res(JSON.parse(data));

			}
		}

	});

});


/**
 * @function
 * @param {string} path
 * @param {*} data
 * @returns {Promise}
 */
export const writeJSON = (path: string, data: any) => new Promise<void>((res, rej) => {

	fs.writeFile(path, JSON.stringify(data), { flag: 'w+' }, err => {
		err ? rej(err) : res();
	});

});