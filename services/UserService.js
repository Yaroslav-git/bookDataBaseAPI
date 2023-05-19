import User from '../models/User.js';

class UserService {

    async getOne(userName, userPassword) {

        if (!userName) {
            throw new Error('login is required');
        }
        if (!userPassword) {
            throw new Error('password is required');
        }

        let userData;

        try {
            userData = await User.getUserData(userName, userPassword);
        } catch (err) {
            throw new Error(err);
        }

        if ( !userData )
            throw new Error('user not found');

        if ( !userData || !userData['id'] || !userData['login'] )
            throw new Error('incorrect user data');

        return userData;
    }
}

export default new UserService()