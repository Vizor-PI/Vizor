var empresaModel = require("../models/empresaModel");

function buscarDadosEmpresa(req, res) {

  empresaModel.buscarDadosEmpresa().then((resultado) => {
    res.status(200).json(resultado);
  });
}

module.exports = {
  buscarDadosEmpresa
};
