 function alerta(icone, texto) {
    Swal.fire({
      position: "center",
      icon: icone,
      title: texto,
      showConfirmButton: false,
      timer: 4000,
      background: "rgb(0,0,0,0.9)",
      color: "#f1f1f1",
      heightAuto: false,
      customClass: {
        popup: 'alerta-custom',   // caixa toda
        title: 'alerta-titulo',   // só o título
        icon: 'alerta-icone'      // só o ícone
      }
    });

  }

  