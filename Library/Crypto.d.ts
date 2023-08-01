/**
 * @module cerberus-mvc/Library/Crypto
 * @class Crypto
 * @description Common resource element, functional only, providing crypto functionality
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default class Crypto {

	/**
	 * @public @static @name md5
	 * @description Create an MD5 hash
	 * @param {String} s The string to hash
	 * @return {String} A hash of the string
	 */
	static md5(s: string): string;

	/**
	 * @public @static @name sha256
	 * @description Create an sha256 hash
	 * @param {String} s The string to hash
	 * @return {String} A hash of the string
	 */
	static sha256(s: string): string;

	/**
	 * @public @static @name md5
	 * @description Create a password hash using sha256
	 * @param {String} text The string to hash
	 * @param {String} salt The salt to use
	 * @return {String} A hash of the string with salt hash at front
	 * @example To create a new hash... Crypto.passwordHash('paul smith')
	 * @example To create a new hash with original salt for verifying... Crypto.passwordHash('paul smith', hash.substring(0, hash.length / 2))
	 */
	static passwordHash(text: string, salt: string): string;

	/**
	 * @public @static @name encryptAES256CBC
	 * @description Create a 256bit AES encrypted string
	 * @param {String} string The string to encrypt
	 * @param {String} password The password to use as a key
	 * @param {String} salt (optional) The salt to mix the password up with in key gen
	 * @return {String} An encrypted string
	 * @example encryptAES256CBC('Something', 'ABC...XYZ');
	 */
	static encryptAES256CBC(string: string, password: string, salt: string): string;

	/**
	 * @public @static @name decryptAES256CBC
	 * @description Decrypt a 256bit AES encrypted string
	 * @param {String} enc The encrypted string to decrypt
	 * @param {String} password The password to use as a key
	 * @param {String} salt (optional) The salt to mix the password up with in key gen
	 * @return {String} A decrypted string
	 * @example let decryptedString = decryptAES256CBC('ab3927d55ge....fdfdf44dfd', 'ABC...XYZ');
	 */
	static decryptAES256CBC(enc: string, password: string, salt: string): string;

	/**
	 * @public @static @method encodeToken
	 * @description Creates a JWT encoded token for use in passing to the public
	 * @param {String} key The key to hide in the token
	 * @return {String} Encrypted JWT token
	 */
	static encodeToken(scope: string, key: string, host: string, origin: string, expire: number, JWTKey: string, AESKey: string): string;

	/**
	 * @public @static @method decodeToken
	 * @description Decodes a reset key and return key
	 * @param {String} token The token to decode
	 * @return {String} The key from in the token
	 */
	static decodeToken(scope: string, token: string, JWTKey: string, AESKey: string): string;
}