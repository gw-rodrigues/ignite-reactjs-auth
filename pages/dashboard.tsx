import type { NextPage } from "next";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Home.module.css";

const Dashboard: NextPage = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className={styles.container}>
      <h1>Dashboard: {user?.email}</h1>
    </div>
  );
};

export default Dashboard;
