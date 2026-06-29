// Simple end-to-end test script: login then fetch projects
(async () => {
  try {
    const loginRes = await fetch('http://localhost:3333/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'student123' }),
    });

    console.log('login status', loginRes.status);
    const loginBody = await loginRes.json().catch(() => null);
    console.log('login body', loginBody);

    const token = loginBody?.accessToken || loginBody?.token || loginBody?.data?.accessToken || loginBody?.data?.token;
    if (!token) {
      console.error('No token received from login');
      process.exit(2);
    }

    const projectsRes = await fetch('http://localhost:3333/projects', {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('projects status', projectsRes.status);
    const projectsBody = await projectsRes.json().catch(() => null);
    console.log('projects body', JSON.stringify(projectsBody, null, 2));
  } catch (err) {
    console.error('E2E test failed:', err);
    process.exit(1);
  }
})();
