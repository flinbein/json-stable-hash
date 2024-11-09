export default async function(obj, algorithm, encoding = "hex") {
	const hash = new HashModel(algorithm);
	updateHash(hash, obj);
	return hash.digest(encoding);
}
const TypedArray = Object.getPrototypeOf(Uint8Array);
const encoder = new TextEncoder();
class HashModel {
	#data = new Uint8Array(0);
	#algorithm
	constructor(algorithm) {
		this.#algorithm = algorithm;
	}
	update(value){
		if (typeof value === "string") {
			this.append(encoder.encode(value));
			return;
		}
		if (value instanceof TypedArray){
			this.append(new Uint8Array(value.buffer, value.byteLength, value.byteLength));
			return;
		}
	}
	append(data){
		const newData = new Uint8Array(this.#data.byteLength + data.byteLength);
		newData.set(this.#data);
		newData.set(data, this.#data.byteLength);
		this.#data = newData;
	}
	async digest(encoding){
		const buf = this.#data.buffer.slice(this.#data.byteOffset, this.#data.byteOffset + this.#data.byteLength);
		const binData = await crypto.subtle.digest(this.#algorithm, buf);
		if (encoding === "hex") return buf2hex(binData);
		return binData;
	}
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
	return [...new Uint8Array(buffer)]
	.map(x => x.toString(16).padStart(2, '0'))
	.join('');
}

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
