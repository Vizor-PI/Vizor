const db = require("../database/config");

function getKpis(start, end) {
    let dateFilter = "";
    if (start && end) dateFilter = `WHERE a.timestamp BETWEEN '${start}' AND '${end}'`;

    const sql = `
      SELECT
        (SELECT COUNT(*) FROM alertas a ${dateFilter}) AS totalAlerts,
        (SELECT COUNT(*) FROM alertas a
         JOIN parametro p ON p.id = a.fkParametro
         JOIN componente c ON c.id = p.fkComponente
         WHERE c.nome = 'CPU' AND p.valorParametro > 85) AS criticalAlerts,

        -- modelo mais afetado
        (SELECT m.nome
         FROM alertas a
         JOIN parametro p ON p.id = a.fkParametro
         JOIN modelo m ON m.id = p.fkModelo
         ${dateFilter}
         GROUP BY m.id
         ORDER BY COUNT(*) DESC
         LIMIT 1) AS topModel,

        -- lote mais afetado
        (SELECT l.id
         FROM alertas a
         JOIN parametro p ON p.id = a.fkParametro
         JOIN miniComputador mc ON mc.id = p.fkMiniComputador
         JOIN lote l ON l.id = mc.fkLote
         ${dateFilter}
         GROUP BY l.id
         ORDER BY COUNT(*) DESC
         LIMIT 1) AS topLote;
    `;

    return db.promise().query(sql);
  }

  function topModels(start, end) {
    let dateFilter = "";
    if (start && end) dateFilter = `WHERE a.timestamp BETWEEN '${start}' AND '${end}'`;

    const sql = `
      SELECT m.nome AS name, COUNT(*) AS count
      FROM alertas a
      JOIN parametro p ON p.id = a.fkParametro
      JOIN modelo m ON m.id = p.fkModelo
      ${dateFilter}
      GROUP BY m.id
      ORDER BY count DESC
      LIMIT 5;
    `;
    return db.promise().query(sql);
  }

  function topLotes(start, end) {
    let dateFilter = "";
    if (start && end) dateFilter = `WHERE a.timestamp BETWEEN '${start}' AND '${end}'`;

    const sql = `
      SELECT l.id AS name, COUNT(*) AS count
      FROM alertas a
      JOIN parametro p ON p.id = a.fkParametro
      JOIN miniComputador mc ON mc.id = p.fkMiniComputador
      JOIN lote l ON l.id = mc.fkLote
      ${dateFilter}
      GROUP BY l.id
      ORDER BY count DESC
      LIMIT 5;
    `;
    return db.promise().query(sql);
  }

  function comparison(start, end, type) {
    let dateFilter = "";
    if (start && end) dateFilter = `WHERE a.timestamp BETWEEN '${start}' AND '${end}'`;

    const sql = `
      SELECT 
        DATE(a.timestamp) AS dia,
        m.nome AS modelo,
        COUNT(*) AS qtd
      FROM alertas a
      JOIN parametro p ON p.id = a.fkParametro
      JOIN componente c ON c.id = p.fkComponente
      JOIN modelo m ON m.id = p.fkModelo
      ${dateFilter} AND c.nome = '${type}'
      GROUP BY dia, modelo
      ORDER BY dia;
    `;
    return db.promise().query(sql);
  }

  function heatmap(start, end) {
    let dateFilter = "";
    if (start && end) dateFilter = `WHERE a.timestamp BETWEEN '${start}' AND '${end}'`;

    const sql = `
      SELECT 
        DAYOFWEEK(a.timestamp) AS dia,
        HOUR(a.timestamp) AS hora,
        COUNT(*) AS qtd
      FROM alertas a
      ${dateFilter}
      GROUP BY dia, hora;
    `;
    return db.promise().query(sql);
  }

  function list(start, end, view, state, order) {
    let dateFilter = "";
    if (start && end) dateFilter = `WHERE a.timestamp BETWEEN '${start}' AND '${end}'`;

    const sql = `
      SELECT 
         m.nome AS name,
         'modelo' AS type,
         COUNT(*) AS total,
         SUM(CASE WHEN c.nome='CPU' AND p.valorParametro > 85 THEN 1 ELSE 0 END) AS critical
      FROM alertas a
      JOIN parametro p ON p.id = a.fkParametro
      JOIN modelo m ON m.id = p.fkModelo
      JOIN componente c ON c.id = p.fkComponente
      ${dateFilter}
      GROUP BY m.id
      ORDER BY total DESC;
    `;
    return db.promise().query(sql);
  }

  function recommend(start, end) {
    let dateFilter = "";
    if (start && end) dateFilter = `WHERE a.timestamp BETWEEN '${start}' AND '${end}'`;

    const sql = `
        SELECT 
          m.nome AS modelo,
          COUNT(*) AS qtd
        FROM alertas a
        JOIN parametro p ON p.id = a.fkParametro
        JOIN modelo m ON m.id = p.fkModelo
        ${dateFilter}
        GROUP BY m.id
        ORDER BY qtd DESC;
    `;
    return db.promise().query(sql);
  }

  function listAlerts(type, id) {
    let filter = "";

    if (type === "model") filter = `p.fkModelo = ${id}`;
    if (type === "lote") filter = `mc.fkLote = ${id}`;

    const sql = `
      SELECT 
        a.timestamp, 
        c.nome AS type, 
        p.valorParametro AS severity,
        CONCAT('Alerta de ', c.nome, ' valor: ', p.valorParametro) AS message
      FROM alertas a
      JOIN parametro p ON p.id = a.fkParametro
      JOIN componente c ON c.id = p.fkComponente
      JOIN miniComputador mc ON mc.id = p.fkMiniComputador
      WHERE ${filter}
      ORDER BY a.timestamp DESC;
    `;

    return db.promise().query(sql);
  }

module.exports = {
    getKpis,
    topModels,
    topLotes,
    comparison,
    heatmap,
    list, 
    recommend,
    listAlerts
};

