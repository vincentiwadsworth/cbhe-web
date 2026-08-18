"""Fetch financial prices: BCB USD/BOB + yfinance commodities."""
import json
import re
import sys
from datetime import datetime, timedelta, timezone

import httpx
import yfinance as yf
from bs4 import BeautifulSoup

BCB_URL = "https://www.bcb.gob.bo/librerias/indicadores/otras/ultimo.php"
COMMODITIES = {
    "WTI": {"ticker": "CL=F", "unit": "USD/barril", "label": "WTI Crudo"},
    "BRENT": {"ticker": "BZ=F", "unit": "USD/barril", "label": "Brent Crudo"},
    "HENRY_HUB": {"ticker": "NG=F", "unit": "USD/MMBtu", "label": "Henry Hub"},
    "TTF": {"ticker": "TTF=F", "unit": "EUR/MWh", "label": "TTF Gas Europeo"},
}


def parse_usd_official(html: str) -> float:
    """Extract the official USD/BOB rate (TCO único) from BCB's ultimo.php page."""
    soup = BeautifulSoup(html, "html.parser")
    for div in soup.find_all("div", class_="bloque-titulo"):
        if "Boliviano respecto al D" not in div.get_text():
            continue
        table = div.find_next("table")
        for tr in table.find_all("tr"):
            cells = [td.get_text(strip=True) for td in tr.find_all("td")]
            if "USD" in cells:
                return float(cells[-1].replace(",", "."))
    raise ValueError(f"No se pudo parsear USD/BOB de {BCB_URL}")


def fetch_usd_bob() -> dict[str, float]:
    text = httpx.get(BCB_URL, timeout=30).text
    return {"official": parse_usd_official(text)}


def fetch_commodities() -> dict[str, dict]:
    result = {}
    for key, info in COMMODITIES.items():
        t = yf.Ticker(info["ticker"])
        hist = t.history(period="1d")
        if hist.empty:
            raise ValueError(f"No data from yfinance for {info['ticker']}")
        price = round(float(hist["Close"].iloc[-1]), 4)
        result[key] = {"price": price, "unit": info["unit"], "label": info["label"]}
    return result


def main() -> None:
    output_path = "data/prices.json"

    try:
        usd_bob = fetch_usd_bob()
        updated = datetime.now(timezone.utc).isoformat()
        stale_since = None
    except Exception as exc:
        print(f"[BCB ERROR] {exc}", file=sys.stderr)
        try:
            with open(output_path, encoding="utf-8") as f:
                prev = json.load(f)
            usd_bob = prev["usd_bob"]
            updated = prev.get("updated")
            stale_since = prev.get("stale_since") or datetime.now(timezone.utc).isoformat()
            print(f"[BCB] Using cached USD/BOB values (stale since {stale_since})", file=sys.stderr)
        except Exception:
            print("[BCB] No cached values — aborting", file=sys.stderr)
            sys.exit(1)

        stale_dt = datetime.fromisoformat(stale_since)
        if datetime.now(timezone.utc) - stale_dt > timedelta(days=7):
            print(f"[BCB ERROR] USD/BOB stale since {stale_since} (>7 days) — aborting", file=sys.stderr)
            sys.exit(1)

    try:
        commodities = fetch_commodities()
    except Exception as exc:
        print(f"[YFINANCE ERROR] {exc}", file=sys.stderr)
        try:
            with open(output_path, encoding="utf-8") as f:
                prev = json.load(f)
            commodities = prev["commodities"]
            print("[YFINANCE] Using cached commodity values", file=sys.stderr)
        except Exception:
            print("[YFINANCE] No cached values — aborting", file=sys.stderr)
            sys.exit(1)

    data = {
        "updated": updated,
        "usd_bob": usd_bob,
        "commodities": commodities,
    }
    if stale_since:
        data["stale_since"] = stale_since

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
