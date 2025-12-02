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
        <img src="../assets/imgs/logosDash/dashboardIcon.png" alt="" id="logoNavbarDash" />
        <a href="dashboard.html"> Dashboard </a>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/dashboardIcon.png" alt="" id="logoNavbarDash" />
        <a href="reclamacaoLote.html"> Reclamação </a>
      </li>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/avisos.png" alt="" id="logoNavbarDash" />
        <a href="avisoDash.html"> Avisos </a>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/avisos.png" alt="" id="logoNavbarDash" />
        <a href="Lotes.html">Lotes</a>
      </li>
      <li class="nav-item" id="adm-only">
        <img src="../assets/imgs/logosDash/logoGestao.png" alt="" id="logoNavbarDash" />
        <a href="gestaoUsuarios.html"> Contas </a>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/mudarContaIcon.png" alt="" id="logoNavbarDash" />
        <a href="alterarDados.html"> Alterar dados </a>
      </li>
      <li class="nav-item" id="adm-only2">
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
