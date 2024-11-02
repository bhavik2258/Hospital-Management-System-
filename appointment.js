function fetchDoctors() {
    // This function can be expanded to fetch doctors based on specialization and hospital.
    // For now, it's a placeholder.
}

function confirmAppointment() {
    const patientId = document.getElementById("patientId").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const name = document.getElementById("name").value;
    const doctorName = document.getElementById("doctorName").value;
    const specialization = document.getElementById("specialization").value;
    const hospital = document.getElementById("hospital").value;
    const appointmentDate = document.getElementById("appointmentDate").value;
    const appointmentTime = document.getElementById("appointmentTime").value;

    // Check if all required fields are filled
    if (patientId && phoneNumber && name && doctorName && specialization && hospital && appointmentDate && appointmentTime) {
        // Create the confirmation message
        const confirmationMessage = `
            <h2>Appointment Confirmation</h2>
            <p><strong>Patient ID:</strong> ${patientId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone Number:</strong> ${phoneNumber}</p>
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Specialization:</strong> ${specialization}</p>
            <p><strong>Hospital:</strong> ${hospital}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
        `;

        // Display confirmation message
        document.getElementById("confirmationMessage").innerHTML = confirmationMessage;

        // Optionally hide the form
        document.getElementById("appointmentForm").style.display = "none";
    } else {
        alert("Please fill in all fields.");
    }
}
