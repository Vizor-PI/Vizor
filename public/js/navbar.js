navbarConstructor.innerHTML += `
 <!-- Logo -->
      <a href="#">
        <img
          src="../assets/imgs/logosDash/logoDashboard.png"
          alt=""
          class="imagemLogoDashboard"
        />
      </a>

      <!-- Menu -->
      <ul id="textosNavbar">
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/home.png" alt="" id="logoNavbarDash" />
        <a href="inicioDash.html" style="color: aqua"> Início </a>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/logoGestao.png" alt="" id="logoNavbarDash" />
        <a href="gestaoUsuarios.html"> Painel </a>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/dashboardIcon.png" alt="" id="logoNavbarDash" />
        <a href="dashboard.html"> Dashboard </a>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/avisos.png" alt="" id="logoNavbarDash" />
        <a href="avisoDash.html"> Avisos </a>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/mudarContaIcon.png" alt="" id="logoNavbarDash" />
        <a href="gestaoUsuarios.html"> Alterar dados </a>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/configIcon.png" alt="" id="logoNavbarDash" />
        <a href="infoConta.html"> Info. da conta </a>
      </li>
    </ul>

      <!-- Botão Sair -->
      <div id="divSair">
        <img src="../assets/imgs/logosDash/exitIcon.png" id="logoNavbarDash" />
        <a href="../index.html" onclick="limparSessao()"> Sair </a>
      </div>
 `;
