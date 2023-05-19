import Session from '../models/Session.js';

class SessionService {

    async getOne(sessionId) {

        if (!sessionId) {
            throw new Error('sessionId is required');
        }

        let sessionData;

        try {
            sessionData = await Session.getSessionData(sessionId);
        } catch (err) {
            throw new Error(err);
        }

        return sessionData;
    }

    async startUserSession(userId, userName){

        if (!userName) {
            throw new Error('userName is required');
        }

        let sessionId, res;

        try {
            sessionId = await Session.generateSessionId(userName);
        } catch (err) {
            throw new Error(err);
        }

        if (!sessionId ){
            throw new Error('sessionId generate error');
        }

        try {
            res = await Session.startSession(sessionId, userId)
        } catch (err) {
            throw new Error(err);
        }

        if (!res ){
            throw new Error('session start error');
        }

        return sessionId;
    }

    async removeInvalidSessions() {

        let res;

        try {
            res = await Session.removeInvalidSessions();
        } catch (err) {
            throw new Error(err);
        }

        if (!res ){
            throw new Error('remove invalid sessions error');
        }

        return true;
    }

    async closeSession(sessionId) {

        let res;

        try {
            res = await Session.closeSession(sessionId);
        } catch (err) {
            throw new Error(err);
        }

        if (!res ){
            throw new Error('close session error');
        }

        return true;
    }

    async prolongSession(sessionId) {

        let res;

        try {
            res = await Session.prolongSession(sessionId);
        } catch (err) {
            throw new Error(err);
        }

        if (!res ){
            throw new Error('prolong session error');
        }

        return true;
    }
}

export default new SessionService()