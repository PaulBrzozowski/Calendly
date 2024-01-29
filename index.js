const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2'); // Make sure to install mysql module
const db = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'password',
    database: 'sys'
});
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the splash page
app.get('/splash', (req, res) => {
    // Example: Fetch events from the database
    db.query('SELECT * FROM events', (err, results) => {
        if (err) {
            // Handle error
            console.error(err);
            res.status(500).send('Server error');
            return;
        }
        res.render('splash', { events: results });
    });
});
app.get('/createevent', (req, res) => {
    res.render('createevent');
});

app.post('/add-event', (req, res) => {
    const { title, start_time, end_time, description, tag } = req.body;
    console.log(title, start_time, end_time, description, tag);
    const query = 'INSERT INTO events (title, start_time, end_time, description, tag) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [title, start_time, end_time, description, tag], (err, result) => {
        if (err) throw err;
        console.log('Event added');
        res.redirect('/splash'); // Redirect back to the calendar page or to a success page
    });
});
app.post('/delete-event', (req, res) => {
    const { eventId } = req.body; // Assuming you're sending the ID of the event to delete

    // Database query to delete the event
    const query = 'DELETE FROM events WHERE id = ?';
    db.query(query, [eventId], (err, result) => {
        if (err) {
            // Handle error
            console.error(err);
            res.status(500).send('Error deleting event');
            return;
        }
        res.redirect('/splash'); // Redirect back to the calendar page
    });
});
app.post('/update-event', (req, res) => {
    const { eventId, title, start_time, end_time, description, tag } = req.body;

    // Database query to update the event
    const query = 'UPDATE events SET title = ?, start_time = ?, end_time = ?, description = ?, tag = ? WHERE id = ?';
    db.query(query, [title, start_time, end_time, description, tag, eventId], (err, result) => {
        if (err) {
            // Handle error
            console.error(err);
            res.status(500).send('Error updating event');
            return;
        }
        res.redirect('/splash'); // Redirect back to the calendar page
    });
});
// Fallback route for the home page or any other route
app.get('*', (req, res) => {
    res.send('Welcome to the Calendar App!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
