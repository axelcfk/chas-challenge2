"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {
      router.push("/login");
      return;
    }
    const userId = localStorage.getItem('userId');
    // Logga userId
    console.log('Current userId:', userId);
    console.log('Current userData:', userData);

    // Exempel på API-anrop för att hämta användardata
    fetch(`http://localhost:3010/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      return response.json();
    })
    .then(data => setUserData(data))
    .catch(error => console.error('Failed to fetch user data', error));
  }, []);

  console.log("second userdata: ", userData);

  return (
    <div>
      {userData ? (
        <div>
          <h1>Welcome, {userData.username}!</h1>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}

