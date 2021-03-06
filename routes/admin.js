import express from 'express';
import * as db from '../lib/db';
import crypto from 'crypto-js';

var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('admin/index', { title: 'Express' });
});

router.get('/testConnection', async(req, res) => {
    const getStatus = await db.testConnect();
    res.send( getStatus);
});

router.get('/users', async(req, res, next) => {
    const tbl = 'user';
    const rows = await db.query(`SELECT user_id, email, name, level, status FROM ${tbl}`); 
    res.render('admin/users', { 
        title: 'Express',
        rows: rows
    });
});

router.get('/users/addUser', (req, res, next) => {
    res.render('admin/addUser', { title: 'Express' });
});

router.get('/users/:id', async(req, res, next) => {
    const id = req.params.id;
    const row = await db.query(`SELECT user_id, email, name, status FROM user WHERE user_id=${id}`);
    res.render('admin/detailUser', {
        title: 'Detail User',
        row: row
    });
});

router.get('/category', (req, res, next) => {
    res.render('admin/category', { title: 'Category List' });
});

router.get('/category/addCategory', (req, res, next) => {
    res.render('admin/addCategory', { title: 'Add Category' });
});

router.get('/category/detailCategory', (req, res, next) => {
    res.render('admin/detailCategory', { title: 'Category Detail' });
});

router.get('/items', (req, res, next) => {
    res.render('admin/items', {title: 'Item List'});
});

router.get('/category/addItem', (req, res, next) => {
    res.render('admin/addItem', {title: 'Add Item'});
});

router.get('/category/detailItem', (req, res, next) => {
    res.render('admin/detailItem', {title: 'Item Detail'});
});

router.get('/updatePassword', (req, res, next) => {
    res.render('admin/updatePassword', { title: 'Change Password' });
});

router.get('/deleteUser/:id', async(req, res) => {
    const id = req.params.id;
    const tableName = 'user';
    const result = await db.query(`DELETE FROM ${tableName} WHERE user_id=${id}`);
    console.log(result);
    res.redirect('/admin/users');
});

/*
* POST method below
*/
router.post('/createUser', async(req,res) =>{
    const {email, password, password2, name} = req.body;
    const tableName = 'user';
    const hashedPassword = crypto.SHA3(password, {outputLength: 512}).toString();
    const tableValue = {
        name: name, 
        email: email, 
        password: hashedPassword,
        status: 1,
        level: 1
    }
    const result = await db.insertRow(tableName, tableValue, res);
    res.redirect('/admin/users');
});

router.post('/editUser/:id', async(req,res) =>{
    const {email, password, password2, name, status} = req.body;
    const id = req.params.id;
    const tableName = 'user';
    const condition = {
        user_id:id
    }
    if(password===password2){
        const hashedPassword = crypto.SHA3(password, {outputLength: 512}).toString();
        if(password!=''){
            const tableValue = {
                name: name, 
                email: email, 
                password: hashedPassword,
                status: status
            }
            const result = await db.updateRow(tableName, tableValue, condition, res);
        }else{
            const tableValue = {
                name: name, 
                email: email,
                status: status
            }
            const result = await db.updateRow(tableName, tableValue, condition, res);            
        }
        res.redirect('/admin/users');
    }else{
        var err = new Error('Password not match');
        err.status = 'Password not match'
        res.send(err.status);
    }
});

module.exports = router;
