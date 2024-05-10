import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();
  const { userId } = router.query;
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      setUserData(data);
    };
    if (userId) {
      fetchData();
    }
  }, [userId]);

  return (
    <div>
      <div>hej</div>
      <h1>Profile of {userData.username}</h1>
      <p>{userData.email}</p>
    </div>
  );
}
