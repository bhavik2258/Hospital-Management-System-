const API_URL = 'http://localhost:3000';

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for Scroll Animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});

document.querySelectorAll('.feature-card').forEach((el) => observer.observe(el));

// Hide loader after content is loaded
window.addEventListener('load', () => {
    document.querySelector('.loader').style.display = 'none';
});

// Patient Registration
async function registerPatient(event) {
    event.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        alert('Registration successful!');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
}

// Patient Login
async function loginPatient(event) {
    event.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('patientId', data.patientId);
        localStorage.setItem('fullName', data.fullName);
        window.location.href = 'appointment.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

// Load Departments
async function loadDepartments() {
    try {
        const response = await fetch(`${API_URL}/departments`);
        const departments = await response.json();
        
        const departmentSelect = document.getElementById('department');
        departmentSelect.innerHTML = '<option value="">Select Department</option>';
        
        departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department.department_id;
            option.textContent = department.department_name;
            departmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Load Doctors based on Department
async function loadDoctors(departmentId) {
    try {
        const response = await fetch(`${API_URL}/doctors?departmentId=${departmentId}`);
        const doctors = await response.json();
        
        const doctorSelect = document.getElementById('doctor');
        doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
        
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.doctor_id;
            option.textContent = doctor.full_name;
            doctorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Book Appointment
async function bookAppointment(event) {
    event.preventDefault();
    
    const formData = {
        patientId: localStorage.getItem('patientId'),
        doctorId: document.getElementById('doctor').value,
        departmentId: document.getElementById('department').value,
        appointmentDate: document.getElementById('appointmentDate').value,
        appointmentTime: document.getElementById('appointmentTime').value,
        reasonForVisit: document.getElementById('symptoms').value
    };

    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Appointment booking failed');
        }

        // Store appointment details in localStorage
        localStorage.setItem('appointmentDetails', JSON.stringify({
            appointmentId: data.appointmentId,
            patientName: data.patientName,  // Now coming from server
            doctorName: data.doctorName,
            department: data.department,
            appointmentDate: data.appointmentDate,
            appointmentTime: data.appointmentTime
        }));

        alert(`Appointment booked successfully! Your appointment ID is ${data.appointmentId}`);
        window.location.href = 'confirmation.html';
    } catch (error) {
        console.error('Appointment booking error:', error);
        alert('Appointment booking failed: ' + error.message);
    }
}

// Get Appointments for a Patient
async function getAppointments() {
    try {
        const response = await fetch(`${API_URL}/appointments/${localStorage.getItem('patientId')}`);
        const appointments = await response.json();
        
        const appointmentList = document.getElementById('appointmentList');
        appointmentList.innerHTML = '';
        
        appointments.forEach(appointment => {
            const appointmentItem = document.createElement('li');
            appointmentItem.textContent = `Appointment ID: ${appointment.appointment_id}, Doctor: ${appointment.doctor_name}, Department: ${appointment.department_name}, Date: ${appointment.appointment_date}, Time: ${appointment.appointment_time}`;
            appointmentList.appendChild(appointmentItem);
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
}

function displayConfirmationDetails() {
    const appointmentDetails = JSON.parse(localStorage.getItem('appointmentDetails'));
    if (appointmentDetails) {
        document.getElementById('appointmentId').textContent = appointmentDetails.appointmentId;
        document.getElementById('patientName').textContent = appointmentDetails.patientName;
        document.getElementById('doctorName').textContent = appointmentDetails.doctorName;
        document.getElementById('department').textContent = appointmentDetails.department;
        document.getElementById('appointmentDate').textContent = formatDate(appointmentDetails.appointmentDate);
        document.getElementById('appointmentTime').textContent = formatTime(appointmentDetails.appointmentTime);
    }
}

// Helper function to format date
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format time
function formatTime(timeString) {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

function logout() {
    localStorage.removeItem('patientId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('appointmentDetails');
    window.location.href = 'login.html';
}

// Event Listeners and Page Load Functions
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('register.html')) {
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', registerPatient);
    } else if (window.location.pathname.includes('login.html')) {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', loginPatient);
    } else if (window.location.pathname.includes('appointment.html')) {
        loadDepartments();
        
        const departmentSelect = document.getElementById('department');
        departmentSelect.addEventListener('change', (e) => {
            loadDoctors(e.target.value);
        });

        const appointmentForm = document.getElementById('appointmentForm');
        appointmentForm.addEventListener('submit', bookAppointment);
    } else if (window.location.pathname.includes('confirmation.html')) {
        displayConfirmationDetails();
    }
});