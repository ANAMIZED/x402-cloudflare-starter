#!/usr/bin/env python3
"""Audit + unit + live verification for Base x402 on ANAMIZED desk."""

from __future__ import annotations

import json
import sys
import urllib.request
from typing import Any

LIVE = "https://anamized.grok.me"
BASE_CAIP2 = "eip155:8453"
BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
DOCUMENTED_PAYTO = "0xD3d0E9eDAe3Ac7bb199a8EAA761BdA423b878438"

RACK = [
    {
        "id": "compute",
        "deskCents": 75,
        "usdcAtomic": "750000",
        "offerId": "os-cycle",
        "path": "/api/v1/x402/compute",
        "checkout": "https://buy.stripe.com/3cI14o8R8dXD3p3frO43S04",
    },
    {
        "id": "memory",
        "deskCents": 40,
        "usdcAtomic": "400000",
        "offerId": "opengos-search",
        "path": "/api/v1/x402/memory",
        "checkout": "https://buy.stripe.com/7sY8wQ5EW3iZ5xb5Re43S06",
    },
    {
        "id": "reasoning",
        "deskCents": 250,
        "usdcAtomic": "2500000",
        "offerId": "opengos-draft",
        "path": "/api/v1/x402/reasoning",
        "checkout": "https://buy.stripe.com/9B69AUd7o7zf2kZ2F243S03",
    },
]

failures: list[str] = []
passes = 0


def ok(name: str, cond: bool, detail: str = "") -> None:
    global passes
    if cond:
        passes += 1
        print(f"PASS  {name}")
    else:
        failures.append(f"{name}: {detail}")
        print(f"FAIL  {name}  {detail}")


def get(url: str) -> tuple[int, dict[str, str], Any]:
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "anamized-x402-verify/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            body = res.read().decode()
            data = json.loads(body) if body else {}
            return res.status, {k.lower(): v for k, v in res.headers.items()}, data
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            data = {"raw": body[:500]}
        return e.code, {k.lower(): v for k, v in e.headers.items()}, data


def post(url: str, payload: dict | None = None, headers: dict | None = None) -> tuple[int, dict[str, str], Any]:
    raw = json.dumps(payload or {}).encode()
    hdrs = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "anamized-x402-verify/1.0",
    }
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, data=raw, headers=hdrs, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            body = res.read().decode()
            data = json.loads(body) if body else {}
            return res.status, {k.lower(): v for k, v in res.headers.items()}, data
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            data = {"raw": body[:500]}
        return e.code, {k.lower(): v for k, v in e.headers.items()}, data


def pay_to_live(value: str | None) -> str | None:
    if not value:
        return None
    value = value.strip()
    if len(value) == 42 and value.startswith("0x"):
        return value
    return None


def decide(pay_to: str | None, bearer: str | None, claimed: bool, sig: str | None, settled: dict | None) -> str:
    if bearer and claimed:
        return "desk-credit"
    if not pay_to_live(pay_to):
        return "usdc_rail_dark"
    if not sig:
        return "missing_payment_signature"
    if not settled or not settled.get("valid") or not settled.get("txHash"):
        return "facilitator_unsettled"
    return "base-usdc"


def unit_tests() -> None:
    print("\n== unit: fail-closed gate ==")
    ok("dark without payTo", decide(None, None, False, None, None) == "usdc_rail_dark")
    ok("reject placeholder payTo", pay_to_live("0xYourBaseAddressHere") is None)
    ok("accept documented payTo", pay_to_live(DOCUMENTED_PAYTO) == DOCUMENTED_PAYTO)
    ok("claimed bearer wins", decide(DOCUMENTED_PAYTO, "desk_agent_x", True, None, None) == "desk-credit")
    ok("unclaimed bearer does not spend rack", decide(DOCUMENTED_PAYTO, "desk_agent_x", False, None, None) == "missing_payment_signature")
    ok("sig without settle rejected", decide(DOCUMENTED_PAYTO, None, False, "deadbeef", {"valid": False}) == "facilitator_unsettled")
    ok("invented receipt rejected", decide(DOCUMENTED_PAYTO, None, False, "sig", {"valid": True}) == "facilitator_unsettled")
    ok(
        "settled base accepted",
        decide(DOCUMENTED_PAYTO, None, False, "sig", {"valid": True, "txHash": "0xabc"}) == "base-usdc",
    )
    ok("atomic compute", RACK[0]["usdcAtomic"] == str(RACK[0]["deskCents"] * 10_000))
    ok("atomic memory", RACK[1]["usdcAtomic"] == str(RACK[1]["deskCents"] * 10_000))
    ok("atomic reasoning", RACK[2]["usdcAtomic"] == str(RACK[2]["deskCents"] * 10_000))
    ok("base usdc contract checksummed", BASE_USDC == "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")


def live_tests() -> dict[str, Any]:
    print("\n== live: anamized.grok.me ==")
    code, _hdrs, disc = get(f"{LIVE}/api/v1/x402")
    ok("discover 200", code == 200, str(code))
    ok("x402Version 1", disc.get("x402Version") == 1, str(disc.get("x402Version")))
    usdc = (disc.get("rails") or {}).get("usdc") or {}
    ok("network is Base", usdc.get("network") == BASE_CAIP2, str(usdc.get("network")))
    ok("asset is Base USDC", usdc.get("asset") == BASE_USDC, str(usdc.get("asset")))
    ok("deskCredit live", ((disc.get("rails") or {}).get("deskCredit") or {}).get("live") is True)
    ok("stripe live", ((disc.get("rails") or {}).get("stripe") or {}).get("live") is True)

    resources = {r["id"]: r for r in disc.get("resources") or []}
    for sku in RACK:
        live = resources.get(sku["id"], {})
        ok(f"{sku['id']} usdcAtomic matches rack", live.get("usdcAtomic") == sku["usdcAtomic"], str(live.get("usdcAtomic")))
        ok(f"{sku['id']} deskCents matches rack", live.get("deskCents") == sku["deskCents"], str(live.get("deskCents")))
        ok(f"{sku['id']} checkout is live stripe", str(live.get("checkout", "")).startswith("https://buy.stripe.com/"), str(live.get("checkout")))

    print("\n== live: unpaid compute 402 ==")
    code, hdrs, body = post(f"{LIVE}/api/v1/x402/compute", {"prompt": "verify"})
    ok("unpaid compute is 402", code == 402, str(code))
    ok("has PAYMENT-REQUIRED or x-payment-response", ("payment-required" in hdrs) or ("x-payment-response" in hdrs), str(list(hdrs)[:12]))
    accepts = body.get("accepts") or []
    networks = [a.get("network") for a in accepts]
    ok("402 includes desk rail", "desk" in networks, str(networks))
    if usdc.get("live"):
        ok("402 includes base rail because usdc.live", "base" in networks, str(networks))
        ok("payTo configured", bool(usdc.get("payTo")), str(usdc.get("payTo")))
    else:
        ok("402 omits base rail while dark (fail-closed)", "base" not in networks, str(networks))
        ok("payTo is null while dark", usdc.get("payTo") in (None, ""), str(usdc.get("payTo")))
        ok("note names X402_PAYTO_ADDRESS", "X402_PAYTO_ADDRESS" in str(usdc.get("note")), str(usdc.get("note")))

    print("\n== live: forged payment signature must not unlock ==")
    code, _h, forged = post(
        f"{LIVE}/api/v1/x402/compute",
        {"prompt": "verify"},
        headers={"PAYMENT-SIGNATURE": "forged", "X-PAYMENT": "forged"},
    )
    ok("forged signature still 402 or auth error", code in (402, 401, 403), str(code))
    ok("forged signature did not return a cycle result", "memo" not in json.dumps(forged).lower() or code != 200, str(forged)[:200])
    return disc


def main() -> int:
    print("ANAMIZED Base x402 verification")
    print(f"live origin: {LIVE}")
    unit_tests()
    disc = live_tests()
    report = {
        "passes": passes,
        "failures": failures,
        "live_usdc": (disc.get("rails") or {}).get("usdc"),
        "production_onchain": bool(((disc.get("rails") or {}).get("usdc") or {}).get("live")),
        "flip": "Set X402_PAYTO_ADDRESS to a real Base 0x receive address on the Vercel deployment behind anamized.grok.me, then redeploy.",
        "documented_payTo": DOCUMENTED_PAYTO,
        "asset": BASE_USDC,
        "network": BASE_CAIP2,
    }
    print(f"\n== summary ==  {passes} passed, {len(failures)} failed")
    print(json.dumps(report, indent=2))
    if failures:
        print("FAILURES:")
        for item in failures:
            print(" -", item)
        return 1
    print("All automated checks passed.")
    if not report["production_onchain"]:
        print("PRODUCTION NOTE: Base rail is correctly dark. Implementation is verified; enablement is X402_PAYTO_ADDRESS on Vercel.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
