'use strict';

const crypto = require('crypto');
const JWT = require('jsonwebtoken');

/**
 * @namespace MVC/Library
 * @class Crypto
 * @description Common resource element, functional only, providing crypto functionality
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Crypto {

	/**
	 * @public @static @name md5
	 * @description Create an MD5 hash
	 * @param {String} s The string to hash
	 * @return {String} A hash of the string
	 */
	static md5(s) {
		// configure funcs
		let L = function (k, d) { return (k << d) | (k >>> (32 - d)) }
		let K = function (G, k) { let I, d, F, H, x; F = (G & 2147483648); H = (k & 2147483648); I = (G & 1073741824); d = (k & 1073741824); x = (G & 1073741823) + (k & 1073741823); if (I & d) { return (x ^ 2147483648 ^ F ^ H) } if (I | d) { if (x & 1073741824) { return (x ^ 3221225472 ^ F ^ H) } else { return (x ^ 1073741824 ^ F ^ H) } } else { return (x ^ F ^ H) } }
		let r = function (d, F, k) { return (d & F) | ((~d) & k) }
		let q = function (d, F, k) { return (d & k) | (F & (~k)) }
		let p = function (d, F, k) { return (d ^ F ^ k) }
		let n = function (d, F, k) { return (F ^ (d | (~k))) }
		let u = function (G, F, aa, Z, k, H, I) { G = K(G, K(K(r(F, aa, Z), k), I)); return K(L(G, H), F) }
		let f = function (G, F, aa, Z, k, H, I) { G = K(G, K(K(q(F, aa, Z), k), I)); return K(L(G, H), F) }
		let D = function (G, F, aa, Z, k, H, I) { G = K(G, K(K(p(F, aa, Z), k), I)); return K(L(G, H), F) }
		let t = function (G, F, aa, Z, k, H, I) { G = K(G, K(K(n(F, aa, Z), k), I)); return K(L(G, H), F) }
		let e = function (G) { let Z; let F = G.length; let x = F + 8; let k = (x - (x % 64)) / 64; let I = (k + 1) * 16; let aa = Array(I - 1); let d = 0; let H = 0; while (H < F) { Z = (H - (H % 4)) / 4; d = (H % 4) * 8; aa[Z] = (aa[Z] | (G.charCodeAt(H) << d)); H++ } Z = (H - (H % 4)) / 4; d = (H % 4) * 8; aa[Z] = aa[Z] | (128 << d); aa[I - 2] = F << 3; aa[I - 1] = F >>> 29; return aa }
		let B = function (x) { let k = "", F = "", G, d; for (d = 0; d <= 3; d++) { G = (x >>> (d * 8)) & 255; F = "0" + G.toString(16); k = k + F.substr(F.length - 2, 2) } return k }
		let J = function (k) { k = k.replace(/rn/g, "n"); let d = ""; for (let F = 0; F < k.length; F++) { let x = k.charCodeAt(F); if (x < 128) { d += String.fromCharCode(x) } else { if ((x > 127) && (x < 2048)) { d += String.fromCharCode((x >> 6) | 192); d += String.fromCharCode((x & 63) | 128) } else { d += String.fromCharCode((x >> 12) | 224); d += String.fromCharCode(((x >> 6) & 63) | 128); d += String.fromCharCode((x & 63) | 128) } } } return d }

		let C = Array();
		let P, h, E, v, g, Y, X, W, V;
		let S = 7, Q = 12, N = 17, M = 22;
		let A = 5, z = 9, y = 14, w = 20;
		let o = 4, m = 11, l = 16, j = 23;
		let U = 6, T = 10, R = 15, O = 21;

		s = J(s);
		C = e(s);
		Y = 1732584193;
		X = 4023233417;
		W = 2562383102;
		V = 271733878;

		for (P = 0; P < C.length; P += 16) {
			h = Y;
			E = X;
			v = W;
			g = V;
			Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
			V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
			W = u(W, V, Y, X, C[P + 2], N, 606105819);
			X = u(X, W, V, Y, C[P + 3], M, 3250441966);
			Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
			V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
			W = u(W, V, Y, X, C[P + 6], N, 2821735955);
			X = u(X, W, V, Y, C[P + 7], M, 4249261313);
			Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
			V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
			W = u(W, V, Y, X, C[P + 10], N, 4294925233);
			X = u(X, W, V, Y, C[P + 11], M, 2304563134);
			Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
			V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
			W = u(W, V, Y, X, C[P + 14], N, 2792965006);
			X = u(X, W, V, Y, C[P + 15], M, 1236535329);
			Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
			V = f(V, Y, X, W, C[P + 6], z, 3225465664);
			W = f(W, V, Y, X, C[P + 11], y, 643717713);
			X = f(X, W, V, Y, C[P + 0], w, 3921069994);
			Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
			V = f(V, Y, X, W, C[P + 10], z, 38016083);
			W = f(W, V, Y, X, C[P + 15], y, 3634488961);
			X = f(X, W, V, Y, C[P + 4], w, 3889429448);
			Y = f(Y, X, W, V, C[P + 9], A, 568446438);
			V = f(V, Y, X, W, C[P + 14], z, 3275163606);
			W = f(W, V, Y, X, C[P + 3], y, 4107603335);
			X = f(X, W, V, Y, C[P + 8], w, 1163531501);
			Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
			V = f(V, Y, X, W, C[P + 2], z, 4243563512);
			W = f(W, V, Y, X, C[P + 7], y, 1735328473);
			X = f(X, W, V, Y, C[P + 12], w, 2368359562);
			Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
			V = D(V, Y, X, W, C[P + 8], m, 2272392833);
			W = D(W, V, Y, X, C[P + 11], l, 1839030562);
			X = D(X, W, V, Y, C[P + 14], j, 4259657740);
			Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
			V = D(V, Y, X, W, C[P + 4], m, 1272893353);
			W = D(W, V, Y, X, C[P + 7], l, 4139469664);
			X = D(X, W, V, Y, C[P + 10], j, 3200236656);
			Y = D(Y, X, W, V, C[P + 13], o, 681279174);
			V = D(V, Y, X, W, C[P + 0], m, 3936430074);
			W = D(W, V, Y, X, C[P + 3], l, 3572445317);
			X = D(X, W, V, Y, C[P + 6], j, 76029189);
			Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
			V = D(V, Y, X, W, C[P + 12], m, 3873151461);
			W = D(W, V, Y, X, C[P + 15], l, 530742520);
			X = D(X, W, V, Y, C[P + 2], j, 3299628645);
			Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
			V = t(V, Y, X, W, C[P + 7], T, 1126891415);
			W = t(W, V, Y, X, C[P + 14], R, 2878612391);
			X = t(X, W, V, Y, C[P + 5], O, 4237533241);
			Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
			V = t(V, Y, X, W, C[P + 3], T, 2399980690);
			W = t(W, V, Y, X, C[P + 10], R, 4293915773);
			X = t(X, W, V, Y, C[P + 1], O, 2240044497);
			Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
			V = t(V, Y, X, W, C[P + 15], T, 4264355552);
			W = t(W, V, Y, X, C[P + 6], R, 2734768916);
			X = t(X, W, V, Y, C[P + 13], O, 1309151649);
			Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
			V = t(V, Y, X, W, C[P + 11], T, 3174756917);
			W = t(W, V, Y, X, C[P + 2], R, 718787259);
			X = t(X, W, V, Y, C[P + 9], O, 3951481745);
			Y = K(Y, h);
			X = K(X, E);
			W = K(W, v);
			V = K(V, g)
		}

		let i = B(Y) + B(X) + B(W) + B(V);

		return i.toLowerCase();
	}

	/**
	 * @public @static @name sha256
	 * @description Create an sha256 hash
	 * @param {String} s The string to hash
	 * @return {String} A hash of the string
	 */
	static sha256(s) {
		var chrsz = 8;
		var hexcase = 0;

		function safe_add(x, y) {
			var lsw = (x & 0xFFFF) + (y & 0xFFFF);
			var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		}

		function S(X, n) { return (X >>> n) | (X << (32 - n)); }
		function R(X, n) { return (X >>> n); }
		function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
		function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
		function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
		function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
		function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
		function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

		function core_sha256(m, l) {
			var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
			var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
			var W = new Array(64);
			var a, b, c, d, e, f, g, h, i, j;
			var T1, T2;

			m[l >> 5] |= 0x80 << (24 - l % 32);
			m[((l + 64 >> 9) << 4) + 15] = l;

			for (var i = 0; i < m.length; i += 16) {
				a = HASH[0];
				b = HASH[1];
				c = HASH[2];
				d = HASH[3];
				e = HASH[4];
				f = HASH[5];
				g = HASH[6];
				h = HASH[7];

				for (var j = 0; j < 64; j++) {
					if (j < 16) W[j] = m[j + i];
					else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

					T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
					T2 = safe_add(Sigma0256(a), Maj(a, b, c));

					h = g;
					g = f;
					f = e;
					e = safe_add(d, T1);
					d = c;
					c = b;
					b = a;
					a = safe_add(T1, T2);
				}

				HASH[0] = safe_add(a, HASH[0]);
				HASH[1] = safe_add(b, HASH[1]);
				HASH[2] = safe_add(c, HASH[2]);
				HASH[3] = safe_add(d, HASH[3]);
				HASH[4] = safe_add(e, HASH[4]);
				HASH[5] = safe_add(f, HASH[5]);
				HASH[6] = safe_add(g, HASH[6]);
				HASH[7] = safe_add(h, HASH[7]);
			}
			return HASH;
		}

		function str2binb(str) {
			var bin = Array();
			var mask = (1 << chrsz) - 1;
			for (var i = 0; i < str.length * chrsz; i += chrsz) {
				bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
			}
			return bin;
		}

		function Utf8Encode(string) {
			string = string.replace(/\r\n/g, "\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		}

		function binb2hex(binarray) {
			var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
			var str = "";
			for (var i = 0; i < binarray.length * 4; i++) {
				str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
					hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
			}
			return str;
		}

		s = Utf8Encode(s);
		return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
	}

	/**
	 * @public @static @name md5
	 * @description Create a password hash using sha256
	 * @param {String} text The string to hash
	 * @param {String} salt The salt to use
	 * @return {String} A hash of the string with salt hash at front
	 * @example To create a new hash... Crypto.passwordHash('paul smith')
	 * @example To create a new hash with original salt for verifying... Crypto.passwordHash('paul smith', hash.substring(0, hash.length / 2))
	 */
	static passwordHash(text, salt) {
		// hash the text
		let textHash = Crypto.sha256(text);

		// set where salt will appear in hash
		let saltStart = text.length;

		// if no salt given create random one //
		if (!salt) salt = Crypto.sha256(Math.random().toString());

		// add salt into text hash at pass length position and hash it //
		let textHashStart, textHashEnd, outHash;
		if (saltStart > 0 && saltStart < salt.length) {
			textHashStart = textHash.substring(0, saltStart);
			textHashEnd = textHash.substring(saltStart, salt.length);
			outHash = Crypto.sha256(textHashEnd + salt + textHashStart);
		}
		else if (saltStart > (salt.length - 1)) outHash = Crypto.sha256(textHash + salt);
		else outHash = Crypto.sha256(salt + textHash);

		// put salt at front of hash //
		return salt + outHash;
	}

	/**
	 * @public @static @name encryptAES256CBC
	 * @description Create a 256bit AES encrypted string
	 * @param {String} string The string to encrypt
	 * @param {String} password The password to use as a key
	 * @param {String} salt (optional) The salt to mix the password up with in key gen
	 * @return {String} An encrypted string
	 * @example encryptAES256CBC('Something', 'ABC...XYZ');
	 */
	static encryptAES256CBC(string, password, salt) {
		let iv = crypto.randomBytes(16);
		let key = crypto.pbkdf2Sync(password, salt || '', 1000, 32, 'sha256');
		let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
		let crypted = cipher.update(string);
		crypted = Buffer.concat([crypted, cipher.final()]);

		return iv.toString('hex') + ':' + crypted.toString('hex');
	}

	/**
	 * @public @static @name decryptAES256CBC
	 * @description Decrypt a 256bit AES encrypted string
	 * @param {String} enc The encrypted string to decrypt
	 * @param {String} password The password to use as a key
	 * @param {String} salt (optional) The salt to mix the password up with in key gen
	 * @return {String} A decrypted string
	 * @example let decryptedString = decryptAES256CBC('ab3927d55ge....fdfdf44dfd', 'ABC...XYZ');
	 */
	static decryptAES256CBC(enc, password, salt) {
		let textParts = enc.split(':');
		let iv = Buffer.from(textParts.shift(), 'hex');
		let key = crypto.pbkdf2Sync(password, salt || '', 1000, 32, 'sha256');
		let encryptedText = Buffer.from(textParts.join(':'), 'hex');
		let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);

		return decrypted.toString();
	}

	/**
	 * @public @static @method encodeToken
	 * @description Creates a JWT encoded token for use in passing to the public
	 * @param {String} key The key to hide in the token
	 * @return {String} Encrypted JWT token
	 */
	static encodeToken(scope, key, host, origin, expire, JWTKey, AESKey) {
		return Crypto.encryptAES256CBC(JWT.sign({
			iss: host,
			aud: origin,
			iat: Math.floor(Date.now() / 1000),
			nbf: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + parseInt(expire),
			key: key,
			scope: scope
		}, JWTKey, { algorithm: 'HS256' }), AESKey);
	}

	/**
	 * @public @static @method decodeToken
	 * @description Decodes a reset key and return key
	 * @param {String} token The token to decode
	 * @return {String} The key from in the token
	 */
	static decodeToken(scope, token, JWTKey, AESKey) {
		token = Crypto.decryptAES256CBC(token, AESKey);
		if (!JWT.verify(token, JWTKey, { algorithm: 'HS256' })) throw Error('Unable to verify token');
		let decoded = JWT.decode(token, { complete: true });
		if (decoded.payload.scope !== scope) throw Error('Unable to verify token scope');
		return decoded.payload.key;
	}
}

module.exports = Crypto;

