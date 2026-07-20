import { useState } from "react";
import { login } from "../api/auth"; // importa a função que comunica com a API
import "../css/login.css";


function Login({ onLogin }) {

  //guardar email e password digitados pelo utilizador
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // função chamada quando o form é submetido
  async function handleSubmit(e) {
    e.preventDefault(); // evita que a página recarregue
    // chama a função login ficheiro auth.js ->faz pedido ao backend
    const data = await login(email, password);

    // guarda o token no browser
    localStorage.setItem("token", data.token);
    // guarda o utilizador (convertido para string)
    localStorage.setItem("user", JSON.stringify(data.user));
    // envia o utilizador para o componente pai
    onLogin(data.user);
  }


  return (
    <div className="login-page">
      {/* fazer o logo do taskly aparecer no login */}
      <section className="login-big-container">
        <div className="cartao-info">
          <h2>Bem-vindo ao Taskly!</h2>
          <p>Cria tarefas, acompanha o progresso e colabora com a tua equipa, tudo num só lugar.</p>

          <ul>
            <li>Tarefas e subtarefas ilimitadas</li>
            <li>Desafios e recompensas</li>
            <li>Colaboração em grupos e amigos</li>
          </ul>
        </div>

        <div className="cartao-login">
          <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button type="submit">Entrar</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;