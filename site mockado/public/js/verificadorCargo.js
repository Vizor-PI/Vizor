function verificarCargo() {
  let codigo = sessionStorage.CODIGOCARGO;

  if (codigo == 2 || codigo == 3) {
    document.getElementById("adm-only").style.display = "none";
    document.getElementById("adm-only2").style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const paginaAtual = window.location.pathname.split("/").pop();

  const linksNavbar = document.querySelectorAll("#textosNavbar .nav-item a");

  linksNavbar.forEach((link) => {
    const linkPagina = link.getAttribute("href").split("/").pop();

    if (linkPagina === paginaAtual) {
      link.parentElement.classList.add("active");
    }
  });
});
