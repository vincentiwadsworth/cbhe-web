"""Minimal test for parse_usd_official — no framework, plain asserts."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "scripts"))
from fetch_prices import parse_usd_official

FIXTURE = """<html>
<body>
<div class="bloque-titulo">Cotización Oficial del Boliviano respecto al Dólar (BCB)</div>
<table class="tabla-cotizacion" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <th width="210">País / Concepto</th>
    <th width="150">Moneda</th>
    <th width="90">Código</th>
    <th width="220">Tipo de Cambio Oficial (TCO)<br />(Bs/USD)</th>
  </tr>
  <tr class="fila1">
    <td>ESTADOS UNIDOS</td>
    <td>DÓLAR</td>
    <td class="centro">USD</td>
    <td class="numero">11.55</td>
  </tr>
</table>

<div class="bloque-titulo">COTIZACIÓN DE MONEDAS</div>
<table class="tabla-cotizacion" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td>CANADÁ</td>
    <td>DÓLAR</td>
    <td class="centro">CAD</td>
    <td class="numero">8.32672</td>
  </tr>
</table>
</body>
</html>
"""

if __name__ == "__main__":
    assert parse_usd_official(FIXTURE) == 11.55
    print("OK: parse_usd_official(fixture) == 11.55")