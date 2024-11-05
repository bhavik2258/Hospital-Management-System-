const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'immOmi14',
    database: 'hospital_management'
});

// Connect to database
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Routes
app.post('/register', (req, res) => {
    const { fullName, email, phone, dob, gender, address, password } = req.body;
    const sql = 'INSERT INTO patients (full_name, email, phone_number, date_of_birth, gender, address, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [fullName, email, phone, dob, gender, address, password], (err, result) => {
        if (err) {
            console.error('Database error during registration:', err);
            res.status(500).json({ error: 'Registration failed', details: err.message });
            return;
        }
        res.status(201).json({ message: 'Registration successful', patientId: result.insertId });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT patient_id, full_name FROM patients WHERE email = ? AND password = ?';
    
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Login failed' });
            return;
        }
        if (results.length > 0) {
            res.json({
                patientId: results[0].patient_id,
                fullName: results[0].full_name
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.get('/departments', (req, res) => {
    const sql = 'SELECT department_id, department_name, description FROM departments';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch departments' });
            return;
        }
        res.json(results);
    });
});

app.get('/doctors', (req, res) => {
    const departmentId = req.query.departmentId;
    let sql = `
        SELECT d.doctor_id, d.full_name, d.specialization, d.qualification, d.experience_years
        FROM doctors d
    `;
    let params = [];

    if (departmentId && departmentId !== 'undefined') {
        sql += ' WHERE d.department_id = ?';
        params.push(departmentId);
    }
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch doctors' });
            return;
        }
        res.json(results);
    });
});

app.get('/doctor-schedule/:doctorId', (req, res) => {
    const sql = 'SELECT * FROM doctor_schedule WHERE doctor_id = ?';
    
    db.query(sql, [req.params.doctorId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch doctor schedule' });
            return;
        }
        res.json(results);
    });
});

app.post('/appointments', (req, res) => {
    const { patientId, doctorId, departmentId, appointmentDate, appointmentTime, reasonForVisit } = req.body;

    // First, get patient details
    const patientSql = 'SELECT full_name as patientName FROM patients WHERE patient_id = ?';
    
    db.query(patientSql, [patientId], (patientErr, patientResults) => {
        if (patientErr) {
            console.error('Error fetching patient details:', patientErr);
            return res.status(500).json({ error: 'Failed to fetch patient details' });
        }

        // Then, get doctor and department details
        const detailsSql = `
            SELECT 
                d.full_name as doctorName, 
                dept.department_name as department
            FROM doctors d
            JOIN departments dept ON d.department_id = dept.department_id
            WHERE d.doctor_id = ?
        `;

        db.query(detailsSql, [doctorId], (detailsErr, detailsResults) => {
            if (detailsErr) {
                console.error('Error fetching doctor/department details:', detailsErr);
                return res.status(500).json({ error: 'Failed to fetch doctor/department details' });
            }

            // Finally, insert the appointment
            const appointmentSql = `
                INSERT INTO appointments 
                (patient_id, doctor_id, department_id, appointment_date, appointment_time, reason_for_visit)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(appointmentSql, 
                [patientId, doctorId, departmentId, appointmentDate, appointmentTime, reasonForVisit], 
                (appointmentErr, appointmentResult) => {
                    if (appointmentErr) {
                        console.error('Error creating appointment:', appointmentErr);
                        return res.status(500).json({ error: 'Failed to create appointment' });
                    }

                    // Send back all the details needed for confirmation
                    res.status(201).json({
                        appointmentId: appointmentResult.insertId,
                        patientName: patientResults[0].patientName,
                        doctorName: detailsResults[0].doctorName,
                        department: detailsResults[0].department,
                        appointmentDate: appointmentDate,
                        appointmentTime: appointmentTime
                    });
                }
            );
        });
    });
});

// Get appointments for a patient
app.get('/appointments/:patientId', (req, res) => {
    const sql = `
        SELECT 
            a.*,
            d.full_name as doctor_name,
            dept.department_name,
            p.full_name as patient_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.doctor_id
        JOIN departments dept ON a.department_id = dept.department_id
        JOIN patients p ON a.patient_id = p.patient_id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
    
    db.query(sql, [req.params.patientId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch appointments' });
            return;
        }
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});