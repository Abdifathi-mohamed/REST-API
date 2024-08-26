const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql2');


const app = express();
const port = 3000;

app.use(bodyParser.json());

// create database connection

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
});

// connect to database

db.connect((err) => {  
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

// create database

  db.query('CREATE DATABASE IF NOT EXISTS expense_tracker_db', (err, result) => {
    if (err) throw err;
    console.log('Database created or exists already...');

    // Switch to the new database
    db.changeUser({database : 'expense_tracker'}, (err) => {
        if (err) throw err;

        // Create the table if it doesn't exist
        const createExpensesTable = `
            CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL
            )
        `;

        db.query(createExpensesTable, (err, result) => {
            if (err) throw err;
            console.log('Expenses table created or exists already...');
        });
    });
});

// start server

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

//Create Expense
app.post('/expenses', (req, res) => {
    const { name, amount } = req.body;
    const query = 'INSERT INTO expenses (name, amount) VALUES (?, ?)';
    db.query(query, [name, amount], (err, result) => {
    
        if (err) {
            return res.status(500).json({ error: err.message });
    } res.status(201).json({ id: result.insertId, name, amount });
    
    });
});

// Read All Expenses

app.get('/expenses', (req, res) => {
    const query = 'SELECT * FROM expenses';
    db.query(query, (err, results) => {
    
        if (err) {
            return res.status(500).json({ error: err.message });
        } res.status(200).json(results);
    });

});

// Update Expense

app.put('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const { name, amount } = req.body;
    const query = 'UPDATE expenses SET name = ?, amount = ? WHERE id = ?';
    db.query(query, [name, amount, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }res.status(200).json({ message: 'Expense updated successfully' });

    });

});

// Delete Expense

app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM expenses WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        } res.status(200).json({ message: 'Expense deleted successfully' });
    });

});