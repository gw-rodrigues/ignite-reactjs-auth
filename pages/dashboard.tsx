import type { NextPage } from "next";
import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { api } from "../services/api";
import styles from "../styles/Home.module.css";

const Dashboard: NextPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) return;
    api
      .get("/me")
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
  }, [isAuthenticated]);
  return (
    <div className={styles.container}>
      <h1>Dashboard: {user?.email}</h1>
    </div>
  );
};

export default Dashboard;
