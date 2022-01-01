import bcrypt from 'bcryptjs';
import db from '../models/index';

const salt = bcrypt.genSaltSync(10);

let createNewUser = async (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let hashPasswordFormBcrypt = await hashUserPassword(data.password);
			await db.User.create({
				email: data.email,
				password: hashPasswordFormBcrypt,
				firstName: data.firstName,
				lastName: data.lastName,
				phoneNumber: data.phoneNumber,
				address: data.address,
				gender: data.gender === 1 ? true : false,
				roleId: data.roleId,
			});

			resolve('Create User Successfully');
		} catch (e) {
			reject(e);
		}
	});
};

let hashUserPassword = (password) => {
	return new Promise(async (resolve, reject) => {
		try {
			let hashPassword = await bcrypt.hashSync(password, salt);
			resolve(hashPassword);
		} catch (e) {
			reject(e);
		}
	});
};

let getAllUser = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let users = await db.User.findAll({ raw: true });
			resolve(users);
		} catch (e) {
			reject(e);
		}
	});
};

let getUserInfoById = (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.User.findOne({
				where: { id: userId },
				raw: true,
			});

			if (user) {
				resolve(user);
			} else {
				resolve({});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let updateUserData = async (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.User.findOne({ where: { id: data.id } });

			if (user) {
				user.firstName = data.firstName;
				user.lastName = data.lastName;
				user.address = data.address;
				await user.save();
				let allUsers = await db.User.findAll({ raw: true });
				resolve(allUsers);
			} else {
				resolve();
			}
		} catch (e) {
			reject(e);
		}
	});
};

let deleteUserById = (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			await db.User.destroy({
				where: {
					id: userId,
				},
			});
			let allUsers = await db.User.findAll({ raw: true });
			resolve(allUsers);
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	createNewUser: createNewUser,
	getAllUser: getAllUser,
	getUserInfoById: getUserInfoById,
	updateUserData: updateUserData,
	deleteUserById: deleteUserById,
};
