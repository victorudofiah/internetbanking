import { useState } from "react";
import axios from "axios";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://127.0.0.1:8000/users/login/", {
        username,
        password,
      });

      setMessage("Login successful!");
      console.log(res.data);

      // Save token or session if the backend returns any
      localStorage.setItem("user", JSON.stringify(res.data));

      window.location.href = "/dashboard";
    } catch (error) {
      setMessage("Invalid username or password.");
    }
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginForm;
