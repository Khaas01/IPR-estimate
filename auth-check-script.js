// Add this script block at the top of your index.html file, right after the <body> tag

<script>
// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  
  // If user is not logged in, redirect to login page
  if (!user.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }
  
  // If logged in, add user info and logout button to header
  const header = document.querySelector('header');
  if (header) {
    const userDiv = document.createElement('div');
    userDiv.className = 'user-info';
    userDiv.innerHTML = `
      <span>Welcome, ${user.name || user.username}</span>
      <button id="logoutBtn" class="logout-button">Logout</button>
    `;
    header.appendChild(userDiv);
    
    // Add logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
      sessionStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }
});
</script>
