 
 navbarConstructor.innerHTML +=
 `
 <!-- Logo -->
      <a href="#">
        <img
          src="assets/imgs/logosDash/logoDashboard.png"
          alt=""
          class="imagemLogoDashboard"
        />
      </a>

      <!-- Menu -->
      <ul id="textosNavbar">
        <li class="nav-item">
          <img
            src="assets/imgs/logosDash/home.png"
            alt=""
            id="logoNavbarDash"
          />
          <a href="inicioDash.html"> Início </a>
        </li>
        <li class ="nav-item">
        <a href="GestãoUsuarios.html"> Gestão </a>
        </li>
        <li class="nav-item">
          <img
            src="assets/imgs/logosDash/dashboardIcon.png"
            alt=""
            id="logoNavbarDash"
          />

          <a href="#" style="color: aqua"> Dashboard </a>
        </li>
        <li class="nav-item">
          <img
            src="assets/imgs/logosDash/avisos.png"
            alt=""
            id="logoNavbarDash"
          />

          <a href="avisoDash.html"> Avisos </a>
        </li>
        <li class="nav-item">
          <img
            src="assets/imgs/logosDash/mudarContaIcon.png"
            alt=""
            id="logoNavbarDash"
          />

          <a href="alterarDados.html"> Alterar dados </a>
        </li>
        <li class="nav-item">
          <img
            src="assets/imgs/logosDash/configIcon.png"
            alt=""
            id="logoNavbarDash"
          />

          <a href="infoConta.html"> Info. da conta </a>
        </li>
      </ul>

      <!-- Botão Sair -->
      <div id="divSair">
        <img src="assets/imgs/logosDash/exitIcon.png" id="logoNavbarDash" />
        <a href="./index.html" onclick="limparSessao()"> Sair </a>
      </div>
 `
 
 