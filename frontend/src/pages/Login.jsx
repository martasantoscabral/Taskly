import { useState } from "react";
import { login, register } from "../api/auth";
import "../css/login.css";

function Login({ onLogin }) {
  const [modo, setModo] = useState("login");

  const [nome, setNome] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = modo === "login";

  function limparMensagens() {
    setErro("");
    setMensagem("");
  }

  function limparCampos() {
    setNome("");
    setHandle("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  function mudarModo(novoModo) {
    setModo(novoModo);
    limparMensagens();
    limparCampos();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    limparMensagens();

    if (!email.trim() || !password.trim()) {
      setErro("Preenche o email e a password.");
      return;
    }

    if (!isLogin) {
      if (!nome.trim()) {
        setErro("Preenche o teu nome.");
        return;
      }

      if (!handle.trim()) {
        setErro("Escolhe um handle.");
        return;
      }

      if (password.length < 6) {
        setErro("A password deve ter pelo menos 6 caracteres.");
        return;
      }

      if (password !== confirmPassword) {
        setErro("As passwords não coincidem.");
        return;
      }
    }

    try {
      setLoading(true);

      if (isLogin) {
        const data = await login(email, password);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        onLogin(data.user);
      } else {
        await register(nome, email, handle, password);

        setMensagem(
          "Conta criada com sucesso. Já podes iniciar sessão.",
        );

        setModo("login");

        setNome("");
        setHandle("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setErro(error.message || "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-big-container">
        <div className="cartao-info">
          <h2>Bem-vindo ao Taskly!</h2>

          <p>
            Cria tarefas, acompanha o progresso e colabora com a tua
            equipa, tudo num só lugar.
          </p>

          <ul>
            <li>Tarefas e subtarefas ilimitadas</li>
            <li>Desafios e recompensas</li>
            <li>Colaboração em grupos e amigos</li>
          </ul>
        </div>

        <div className="cartao-login">
          <div className="auth-container">
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${isLogin ? "ativo" : ""}`}
                onClick={() => mudarModo("login")}
              >
                Login
              </button>

              <button
                type="button"
                className={`auth-tab ${!isLogin ? "ativo" : ""}`}
                onClick={() => mudarModo("register")}
              >
                Cadastrar
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <h1>{isLogin ? "Login" : "Criar conta"}</h1>

              {!isLogin && (
                <>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Handle, por exemplo martacabral"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  isLogin ? "current-password" : "new-password"
                }
                required
              />

              {!isLogin && (
                <input
                  type="password"
                  placeholder="Confirmar password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  required
                />
              )}

              {erro && <p className="auth-error">{erro}</p>}

              {mensagem && (
                <p className="auth-success">{mensagem}</p>
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "A processar..."
                  : isLogin
                    ? "Entrar"
                    : "Criar conta"}
              </button>
            </form>

            <p className="trocar-modo">
              {isLogin
                ? "Ainda não tens conta?"
                : "Já tens uma conta?"}

              <button
                type="button"
                onClick={() =>
                  mudarModo(isLogin ? "register" : "login")
                }
              >
                {isLogin ? "Cadastrar" : "Iniciar sessão"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;