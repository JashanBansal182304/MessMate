const form = document.getElementById("signupForm");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");

// Form Validation
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match!");
    return;
  }

  if (!document.getElementById("terms").checked) {
    alert("Please agree to the Terms & Conditions.");
    return;
  }

  // Collect form data
  const userData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    rollNumber: document.getElementById("rollno").value,
    hostel: document.getElementById("hostel").value,
    room: document.getElementById("room") ? document.getElementById("room").value : "Not Assigned",
    phone: document.getElementById("phone") ? document.getElementById("phone").value : "Not Provided",
    password: password.value
  };

  console.log('Signup attempt with data:', userData);

  // Call backend API for signup
  signupStudent(userData);
});

// Function to call backend API for student signup
async function signupStudent(userData) {
  try {
    const response = await fetch('http://localhost:8080/api/students/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert('✅ Signup successful! You can now login.');
      // Redirect to login page
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } else {
      alert('❌ Signup failed: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('❌ Network error. Please check if the server is running and try again.');
  }
}
