"""Backend tests for Hot And Tasty Food Shop API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://fast-food-delivery-27.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ====== Menu ======
class TestMenu:
    def test_list_menu_seeded(self, s):
        r = s.get(f"{API}/menu", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Expecting 48 seeded items
        assert len(data) >= 48, f"expected >=48 items got {len(data)}"
        cats = {d["category"] for d in data}
        for c in ["potatoes", "rolls", "momos", "chowmein", "rice", "main-course", "chopsy"]:
            assert c in cats, f"missing category {c}"

    @pytest.mark.parametrize("cat", ["potatoes", "rolls", "momos", "chowmein", "rice", "main-course", "chopsy"])
    def test_filter_by_category(self, s, cat):
        r = s.get(f"{API}/menu", params={"category": cat}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        for d in data:
            assert d["category"] == cat

    def test_create_update_delete_menu(self, s):
        payload = {"name": "TEST_Item", "category": "potatoes", "veg": True, "price_full": 99.0}
        r = s.post(f"{API}/menu", json=payload, timeout=30)
        assert r.status_code == 200
        item = r.json()
        assert item["name"] == "TEST_Item"
        assert item["available"] is True
        item_id = item["id"]

        # Update toggle availability
        r2 = s.put(f"{API}/menu/{item_id}", json={"available": False}, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["available"] is False

        # Verify persistence
        r3 = s.get(f"{API}/menu", timeout=30)
        match = [x for x in r3.json() if x["id"] == item_id]
        assert len(match) == 1 and match[0]["available"] is False

        # Delete
        r4 = s.delete(f"{API}/menu/{item_id}", timeout=30)
        assert r4.status_code == 200

        # Delete again -> 404
        r5 = s.delete(f"{API}/menu/{item_id}", timeout=30)
        assert r5.status_code == 404


# ====== Orders ======
class TestOrders:
    @pytest.fixture(scope="class")
    def menu_items(self, s):
        r = s.get(f"{API}/menu", timeout=30)
        return r.json()

    def test_create_order_cod_low_subtotal(self, s, menu_items):
        # Pick a cheap item to ensure subtotal < 300
        cheap = next(m for m in menu_items if m["price_full"] <= 30)
        payload = {
            "customer_name": "TEST_Cust", "phone": "9999999999", "address": "TEST addr",
            "items": [{"item_id": cheap["id"], "name": cheap["name"], "variant": "full",
                       "unit_price": cheap["price_full"], "quantity": 2}],
            "payment_method": "cod",
        }
        r = s.post(f"{API}/orders", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        o = r.json()
        assert o["payment_method"] == "cod"
        assert o["payment_status"] == "cod"
        assert o["subtotal"] == cheap["price_full"] * 2
        assert o["delivery_fee"] == 30.0
        assert o["total"] == o["subtotal"] + 30.0
        assert o["order_status"] == "received"

        # GET single order
        r2 = s.get(f"{API}/orders/{o['id']}", timeout=30)
        assert r2.status_code == 200
        assert r2.json()["id"] == o["id"]

    def test_create_order_online_high_subtotal_free_delivery(self, s, menu_items):
        # pick expensive item to push subtotal>=300
        expensive = max(menu_items, key=lambda x: x["price_full"])
        payload = {
            "customer_name": "TEST_Online", "phone": "8888888888", "address": "addr",
            "items": [{"item_id": expensive["id"], "name": expensive["name"], "variant": "full",
                       "unit_price": expensive["price_full"], "quantity": 2}],
            "payment_method": "online",
        }
        r = s.post(f"{API}/orders", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        o = r.json()
        assert o["payment_method"] == "online"
        assert o["payment_status"] == "pending"
        assert o["delivery_fee"] == 0.0
        assert o["total"] == o["subtotal"]
        return o

    def test_invalid_item_400(self, s):
        payload = {
            "customer_name": "X", "phone": "1", "address": "a",
            "items": [{"item_id": "non-existent", "name": "x", "variant": "full",
                       "unit_price": 1, "quantity": 1}],
            "payment_method": "cod",
        }
        r = s.post(f"{API}/orders", json=payload, timeout=30)
        assert r.status_code == 400

    def test_empty_cart_400(self, s):
        payload = {"customer_name": "X", "phone": "1", "address": "a", "items": [], "payment_method": "cod"}
        r = s.post(f"{API}/orders", json=payload, timeout=30)
        assert r.status_code == 400

    def test_list_orders_sorted(self, s):
        r = s.get(f"{API}/orders", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        if len(data) >= 2:
            # Sorted desc by created_at
            assert data[0]["created_at"] >= data[1]["created_at"]

    def test_status_update_valid_invalid(self, s, menu_items):
        cheap = next(m for m in menu_items if m["price_full"] <= 30)
        r = s.post(f"{API}/orders", json={
            "customer_name": "TEST_S", "phone": "1", "address": "a",
            "items": [{"item_id": cheap["id"], "name": cheap["name"], "variant": "full",
                       "unit_price": cheap["price_full"], "quantity": 1}],
            "payment_method": "cod",
        }, timeout=30)
        oid = r.json()["id"]

        for st in ["preparing", "out-for-delivery", "delivered"]:
            r2 = s.put(f"{API}/orders/{oid}/status", json={"order_status": st}, timeout=30)
            assert r2.status_code == 200
            assert r2.json()["order_status"] == st

        # Invalid status
        r3 = s.put(f"{API}/orders/{oid}/status", json={"order_status": "bogus"}, timeout=30)
        assert r3.status_code == 400

        # Invalid id
        r4 = s.put(f"{API}/orders/non-existent/status", json={"order_status": "preparing"}, timeout=30)
        assert r4.status_code == 404


# ====== Stripe Checkout ======
class TestCheckout:
    def test_checkout_session_and_status(self, s):
        r_menu = s.get(f"{API}/menu", timeout=30)
        items = r_menu.json()
        expensive = max(items, key=lambda x: x["price_full"])
        r_o = s.post(f"{API}/orders", json={
            "customer_name": "TEST_Stripe", "phone": "1", "address": "a",
            "items": [{"item_id": expensive["id"], "name": expensive["name"], "variant": "full",
                       "unit_price": expensive["price_full"], "quantity": 1}],
            "payment_method": "online",
        }, timeout=30)
        assert r_o.status_code == 200
        order = r_o.json()

        r = s.post(f"{API}/checkout/session", json={"order_id": order["id"], "origin_url": BASE_URL}, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "url" in body and body["url"].startswith("https://")
        assert "session_id" in body and body["session_id"]
        sid = body["session_id"]

        # status
        r2 = s.get(f"{API}/checkout/status/{sid}", timeout=60)
        assert r2.status_code == 200
        st = r2.json()
        assert st["order_id"] == order["id"]
        assert "payment_status" in st
        assert "status" in st


# ====== Admin ======
class TestAdmin:
    def test_admin_login_wrong(self, s):
        r = s.post(f"{API}/admin/login", json={"password": "wrong"}, timeout=30)
        assert r.status_code == 401

    def test_admin_login_correct(self, s):
        r = s.post(f"{API}/admin/login", json={"password": "admin123"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["ok"] is True
