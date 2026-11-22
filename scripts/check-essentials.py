import sys
import re
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = "http://localhost:8000"
failures = []

def log(ok, label, detail=""):
    print(f"{label}: {'OK' if ok else 'FAIL'} {detail}")
    if not ok:
        failures.append(label)

def open_route(page, path):
    page.goto(f"{BASE}/#{path}", wait_until="networkidle")
    page.wait_for_timeout(1200)
    return page.inner_text("body")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.on("pageerror", lambda e: failures.append(f"pageerror: {e}"))

    body = open_route(page, "/essentials")
    log("150 Essentials" in body, "essentials heading")
    log("Practise 150" in body, "practise button", body[:200].replace("\n", " | ") if "Practise 150" not in body else "")
    log("All units" in body, "unit segmented filter")

    page.get_by_role("button", name="Show answers").first.click()
    page.wait_for_timeout(600)
    body = page.inner_text("body")
    log("Why" in body, "show answers reveals reasoning")

    page.get_by_role("button", name="Practise 150").first.click()
    page.wait_for_timeout(1000)
    body = page.inner_text("body")
    log("essentials · 150 questions" in body, "practice session starts", body[:200].replace("\n", " | ") if "essentials · 150" not in body else "")

    open_route(page, "/")
    body = open_route(page, "/essentials")
    page.locator("button", has_text=re.compile(r"^U3")).first.click()
    page.wait_for_timeout(800)
    body = page.inner_text("body")
    log("Practise 150" not in body, "unit filter narrows the list")

    body = open_route(page, "/essentials?unit=6")
    log("Practise " in body, "deep link with unit param")

    body = open_route(page, "/")
    log("150 essentials" in body, "dashboard quick action")

    body = open_route(page, "/revision")
    log("Revision" in body, "revision page renders")

    body = open_route(page, "/about")
    log("150 Essentials" in body, "about module entry")

    browser.close()

print("FAILURES:", failures if failures else "none")
sys.exit(0 if not failures else 1)
