document.addEventListener("DOMContentLoaded", function () {
    // signup form
    const signupformstore = document.getElementById("signupForm");
  
    signupformstore?.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const username = document.getElementById("signupUsername").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirmPassword = document.getElementById("signupConfirmPassword").value;
  
      if (!username || !email || !password || !confirmPassword) {
        alert("All fields are required.");
        return;
      }
  
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
  
      localStorage.setItem("abuser", JSON.stringify({ username, password }));
      alert("signup ho gya");
      window.location.href = "login.html";
    });
  
    // login form
    const loginformstore = document.getElementById("loginForm");
  
    loginformstore?.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;
  
      const userlocal = JSON.parse(localStorage.getItem("abuser"));
  
      if (userlocal && userlocal.username === username && userlocal.password === password) {
        alert("login ho gya");
        window.location.href="index.htm";
      } else {
        alert("login nhi hua");
      }
    });
  });
  