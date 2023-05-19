import Book from '../models/Book.js';

class BookService {

    async getAll(userId) {

        if ( !userId ) {
            throw new Error('userId is required')
        }
        const bookList = await Book.getUserBookList(userId);
        return bookList;
    }

    async getOne(userId, bookId) {

        if ( !userId ) {
            throw new Error('userId is required')
        }
        if ( !bookId ) {
            throw new Error('bookId is required')
        }

        const book = await Book.getUserBook(userId, bookId);

        return book;
    }

    async addBook(userId, bookData) {

        if ( !userId || !isFinite(userId) )
            throw new Error('incorrect userId');

        if ( !bookData['titleRus'] )
            throw new Error('required fields is empty (titleRus)');

        if ( !bookData['authorNameRus'] )
            throw new Error('required fields is empty (authorNameRus)');

        if ( !bookData['publicationYear'] || !isFinite(bookData['publicationYear']) )
            throw new Error('required fields is incorrect (publicationYear)');

        let newBookId;
        let bindCount;
        let updateRes;
        let bindRes;

        try {
            newBookId = await Book.createBook(bookData);
        } catch (err) {
            throw new Error('createBook error: ', err.message);
        }

        if ( !newBookId || !isFinite(newBookId)  )
            throw new Error('incorrect bookId');

        try {
            bindCount = await Book.checkUserBookBind(newBookId, userId);
        } catch (err) {
            throw new Error('checkUserBookBind error: ', err.message);
        }

        try {
            if ( bindCount === 0 )
                bindRes = await Book.bindBookToUser(newBookId, userId);
        } catch (err) {
            throw new Error('bindBookToUser error: ', err.message);
        }

        if ( !bindRes )
            throw new Error('bindBookToUser error: false response');

        try {
            updateRes = await Book.updateUserBookStatus(newBookId, userId, bookData);
        } catch (err) {
            throw new Error('updateUserBookStatus error', err.message);
        }

        if ( !updateRes )
            throw new Error('updateUserBookStatus error: false response. [bookId: '+newBookId+']');

        return newBookId;
    }

    async update(userId, bookId, bookData) {

        let updateRes;
        let isBookExist;

        if ( !bookId || !isFinite(bookId) )
            throw new Error('incorrect bookId');

        if ( !bookData['titleRus'] )
            throw new Error('required fields is empty (titleRus)');

        if ( !bookData['authorNameRus'] )
            throw new Error('required fields is empty (authorNameRus)');

        if ( !bookData['publicationYear'] || !isFinite(bookData['publicationYear']) )
            throw new Error('incorrect required fields (publicationYear)');

        try {
            isBookExist = await Book.isBookExist(bookId);
        } catch (err) {
            throw new Error('isBookExist error: ', err.message);
        }

        if ( !isBookExist )
            throw new Error('book not found');

        try {
            updateRes = await Book.updateBook(bookId, bookData);
        } catch (err) {
            throw new Error('updateBook error', err.message);
        }

        if ( !updateRes )
            throw new Error('updateBook error: false response. [bookId: '+bookId+']');

        try {
            if ( bookData['comment'] || bookData['readStatus'] || bookData['assessment'] )
                updateRes = await Book.updateUserBookStatus(bookId, userId, bookData);
        } catch (err) {
            throw new Error('updateUserBookStatus error', err.message);
        }

        if ( !updateRes )
            throw new Error('updateUserBookStatus error: false response. [bookId: '+bookId+'; userId: '+userId+']');

        return true;
    }

    async delete(userId, bookId) {

        let isBookExist, deleteRes, bindCount;

        if (!bookId || !isFinite(bookId))
            throw new Error('incorrect bookId');

        try {
            isBookExist = await Book.isBookExist(bookId);
        } catch (err) {
            throw new Error('isBookExist error: ', err.message);
        }

        if (!isBookExist)
            throw new Error('book not found');

        try {
            bindCount = await Book.checkUserBookBind(bookId, userId);
        } catch (err) {
            throw new Error('checkUserBookBind error: ', err.message);
        }

        if ( bindCount === 0 )
            throw new Error('book not bind to user');

        try {
            deleteRes = await Book.removeBook(bookId);
        } catch (err) {
            throw new Error('removeBook error', err.message);
        }

        if ( !deleteRes )
            throw new Error('removeBook error: false response. [bookId: '+bookId+']');

        return true;
    }

}


export default new BookService();
//module.exports.BookService = new BookService();
