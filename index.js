const {createHash} = require("node:crypto");
module.exports = function(obj, algorithm, encoding = "hex") {
	const hash = createHash(algorithm);
	updateHash(hash, obj);
	return hash.digest(encoding);
}

const TypedArray = Object.getPrototypeOf(Uint8Array);

function updateHash(hash, obj){
	if (obj === null) hash.update("N");
	if (Array.isArray(obj)) {
		hash.update("[array:"+obj.length+"]");
		for (let element of obj) updateHash(hash, element)
		return;
	}
	if (obj instanceof TypedArray) {
		hash.update("[typedArray:"+obj.constructor.name+":"+obj.byteLength+"]");
		hash.update(obj);
		return;
	}
	if (typeof obj === "object") {
		const keys = Object.keys(obj).sort();
		hash.update("[object:"+keys.length+"]");
		for (let key of keys) {
			hash.update("[key:"+key.length+"]");
			hash.update(key);
			updateHash(hash, obj[key]);
		}
		return;
	}
	const strData = String(obj);
	hash.update("["+typeof obj+":"+strData.length+"]");
	hash.update(strData);
}
