// Add after successful login (around line 40-50)

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.status) {
      console.log('✅ Login successful:', data.data);
      
      // 🔥 NEW: Role-based redirect
      const userRole = data.data.role_id;
      
      switch (userRole) {
        case 1: // OWNER
        case 2: // ADMIN
        case 3: // EMPLOYEE
          navigate('/'); // Go to dashboard
          break;
        case 4: // CUSTOMER
          navigate('/customer'); // Go to customer portal
          break;
        default:
          console.error('Unknown role:', userRole);
          navigate('/'); // Fallback to dashboard
      }
    } else {
      setError(data.message || 'Login failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('Network error. Please try again.');
  } finally {
    setIsLoading(false);
  }
};