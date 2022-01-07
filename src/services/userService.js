import db from '../models/index';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

let handleUserLogin = (email, password) => {
	return new Promise(async (resolve, reject) => {
		try {
			let userData = {};

			let isExist = await checkUserEmail(email);
			if (isExist) {
				//user already exist
				let user = await db.User.findOne({
					attributes: ['email', 'roleId', 'password'],
					where: { email: email },
					raw: true,
				});

				if (user) {
					//compare password
					let check = await bcrypt.compareSync(
						password,
						user.password
					);
					if (check) {
						userData.errCode = 0;
						userData.errMessage = 'Ok';

						delete user.password;
						userData.user = user;
					} else {
						userData.errCode = 3;
						userData.errMessage = 'Mật khẩu không chính xác!';
					}
				} else {
					userData.errCode = 2;
					userData.message = `Tài khoản không tồn tại`;
				}
			} else {
				//return error
				userData.errCode = 1;
				userData.errMessage = `Tài khoản không tồn tại`;
			}
			resolve(userData);
		} catch (err) {
			reject(err);
		}
	});
};

let checkUserEmail = (userEmail) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.User.findOne({ where: { email: userEmail } });
			if (user) {
				resolve(true);
			} else {
				resolve(false);
			}
		} catch (err) {
			reject(e);
		}
	});
};

let getAllUsers = (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let users = '';
			if (userId === 'ALL') {
				users = await db.User.findAll({
					attributes: {
						exclude: ['password'],
					},
				});
			}

			if (userId && userId !== 'ALL') {
				users = await db.User.findOne({
					where: { id: userId },
					attributes: {
						exclude: ['password'],
					},
				});
			}
			resolve(users);
		} catch (err) {
			reject(err);
		}
	});
};

let createNewUser = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			//check email is exist
			let check = await checkUserEmail(data.email);
			if (check === true) {
				resolve({
					errCode: 1,
					errMessage:
						'Email đã tồn tại, vui lòng nhập địa chỉ email khác!',
				});
			} else {
				let hashPasswordFormBcrypt = await hashUserPassword(
					data.password
				);
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

				resolve({
					errCode: 0,
					message: 'OK',
				});
			}
		} catch (err) {
			reject(err);
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

let updateUser = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!data.id) {
				resolve({
					errCode: 2,
					errMessage: 'Missing required parameters',
				});
			}
			let user = await db.User.findOne({
				where: { id: data.id },
				raw: false,
			});
			if (user) {
				user.firstName = data.firstName;
				user.lastName = data.lastName;
				user.address = data.address;

				await user.save();
				resolve({
					errCode: 0,
					message: 'Cập nhật thông tin người dùng thành công',
				});
			} else {
				resolve({
					errCode: 1,
					errMessage: 'Không tìm thấy người dùng',
				});
			}
		} catch (error) {
			reject(error);
		}
	});
};

let deleteUser = (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.User.findOne({
				where: { id: userId },
			});
			if (!user) {
				resolve({
					errCode: 2,
					errMessage: 'Người dùng không tồn tại',
				});
			}
			await db.User.destroy({
				where: { id: userId },
			});

			resolve({
				errCode: 0,
				message: 'Xóa người dùng thành công',
			});
		} catch (err) {
			reject(err);
		}
	});
};

module.exports = {
	handleUserLogin: handleUserLogin,
	getAllUsers: getAllUsers,
	createNewUser: createNewUser,
	deleteUser: deleteUser,
	updateUser: updateUser,
};
