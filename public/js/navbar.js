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
        <a href="dashboardHanieh.html"> Comparação de Modelos </a>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/reclamacoes.png" alt="" id="logoNavbarDash" />
        <a href="reclamacaoLote.html"> Reclamação </a>
      </li>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/clima.png" alt="" id="logoNavbarDash" />
        <a href="climaDash.html"> Painel Climático </a>
      </li>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/incidentes.png" alt="" id="logoNavbarDash" />
        <a href="dashboardIncidentesLocal.html"> Incidentes </a>
      <li class="nav-item">
        <img src="../assets/imgs/logosDash/manutencao.png" alt="" id="logoNavbarDash" />
        <a href="pedroDashboard.html"> Manutenção </a>
      </li>
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
