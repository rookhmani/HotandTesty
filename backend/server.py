from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

app = FastAPI(title="Hot And Tasty Food Shop API")
api_router = APIRouter(prefix="/api")


# ============== MODELS ==============
class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # potatoes | rolls | momos | chowmein | rice | main-course | chopsy
    veg: bool = True
    description: Optional[str] = ""
    image: Optional[str] = ""
    price_half: Optional[float] = None
    price_full: float
    has_variants: bool = False
    available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MenuItemCreate(BaseModel):
    name: str
    category: str
    veg: bool = True
    description: Optional[str] = ""
    image: Optional[str] = ""
    price_half: Optional[float] = None
    price_full: float
    has_variants: bool = False
    available: bool = True


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    veg: Optional[bool] = None
    description: Optional[str] = None
    image: Optional[str] = None
    price_half: Optional[float] = None
    price_full: Optional[float] = None
    has_variants: Optional[bool] = None
    available: Optional[bool] = None


class CartItem(BaseModel):
    item_id: str
    name: str
    variant: str = "full"  # half | full
    unit_price: float
    quantity: int


class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    address: str
    notes: Optional[str] = ""
    items: List[CartItem]
    payment_method: str = "cod"  # cod | upi


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    phone: str
    address: str
    notes: Optional[str] = ""
    items: List[CartItem]
    subtotal: float
    delivery_fee: float = 0.0
    total: float
    payment_method: str  # cod | upi
    payment_status: str = "pending"  # pending | awaiting_payment | paid | cod
    order_status: str = "received"  # received | preparing | out-for-delivery | delivered | cancelled
    utr: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderStatusUpdate(BaseModel):
    order_status: str


class UTRSubmit(BaseModel):
    utr: str


class AdminLoginRequest(BaseModel):
    password: str


class SiteSettingsUpdate(BaseModel):
    upi_id: Optional[str] = None
    upi_name: Optional[str] = None
    upi_qr_image: Optional[str] = None


# ============== HELPERS ==============
def menu_doc_to_item(doc: dict) -> dict:
    doc.pop("_id", None)
    if isinstance(doc.get("created_at"), str):
        try:
            doc["created_at"] = datetime.fromisoformat(doc["created_at"])
        except Exception:
            pass
    return doc


def order_doc_to_item(doc: dict) -> dict:
    doc.pop("_id", None)
    if isinstance(doc.get("created_at"), str):
        try:
            doc["created_at"] = datetime.fromisoformat(doc["created_at"])
        except Exception:
            pass
    return doc


# ============== MENU ROUTES ==============
@api_router.get("/menu", response_model=List[MenuItem])
async def list_menu(category: Optional[str] = None):
    query: Dict[str, Any] = {}
    if category and category != "all":
        query["category"] = category
    docs = await db.menu_items.find(query, {"_id": 0}).to_list(1000)
    return [menu_doc_to_item(d) for d in docs]


@api_router.post("/menu", response_model=MenuItem)
async def create_menu_item(payload: MenuItemCreate):
    item = MenuItem(**payload.model_dump())
    doc = item.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.menu_items.insert_one(doc)
    return item


@api_router.put("/menu/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, payload: MenuItemUpdate):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "Nothing to update")
    result = await db.menu_items.update_one({"id": item_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Menu item not found")
    doc = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    return menu_doc_to_item(doc)


@api_router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Menu item not found")
    return {"ok": True}


# ============== ORDER ROUTES ==============
@api_router.post("/orders", response_model=Order)
async def create_order(payload: OrderCreate):
    if not payload.items:
        raise HTTPException(400, "Cart is empty")

    if payload.payment_method not in ("cod", "upi"):
        raise HTTPException(400, "Invalid payment method")

    item_ids = list({i.item_id for i in payload.items})
    menu_docs = await db.menu_items.find(
        {"id": {"$in": item_ids}}, {"_id": 0}
    ).to_list(1000)
    menu_map = {m["id"]: m for m in menu_docs}

    validated_items: List[CartItem] = []
    subtotal = 0.0
    for ci in payload.items:
        m = menu_map.get(ci.item_id)
        if not m:
            raise HTTPException(400, f"Invalid item: {ci.item_id}")
        if ci.variant == "half" and m.get("price_half"):
            unit_price = float(m["price_half"])
        else:
            unit_price = float(m["price_full"])
        qty = max(1, int(ci.quantity))
        subtotal += unit_price * qty
        validated_items.append(
            CartItem(
                item_id=ci.item_id,
                name=m["name"],
                variant=ci.variant,
                unit_price=unit_price,
                quantity=qty,
            )
        )

    delivery_fee = 0.0 if subtotal >= 300 else 30.0
    total = round(subtotal + delivery_fee, 2)

    payment_status = "cod" if payload.payment_method == "cod" else "awaiting_payment"

    order = Order(
        customer_name=payload.customer_name,
        phone=payload.phone,
        address=payload.address,
        notes=payload.notes or "",
        items=validated_items,
        subtotal=round(subtotal, 2),
        delivery_fee=delivery_fee,
        total=total,
        payment_method=payload.payment_method,
        payment_status=payment_status,
        order_status="received",
    )

    doc = order.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["items"] = [i.model_dump() for i in validated_items]
    await db.orders.insert_one(doc)
    return order


@api_router.get("/orders", response_model=List[Order])
async def list_orders():
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [order_doc_to_item(d) for d in docs]


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Order not found")
    return order_doc_to_item(doc)


@api_router.put("/orders/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, payload: OrderStatusUpdate):
    valid = {"received", "preparing", "out-for-delivery", "delivered", "cancelled"}
    if payload.order_status not in valid:
        raise HTTPException(400, "Invalid status")
    result = await db.orders.update_one(
        {"id": order_id}, {"$set": {"order_status": payload.order_status}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Order not found")
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return order_doc_to_item(doc)


@api_router.post("/orders/{order_id}/utr", response_model=Order)
async def submit_order_utr(order_id: str, payload: UTRSubmit):
    utr = (payload.utr or "").strip()
    if len(utr) < 6:
        raise HTTPException(400, "Enter a valid UTR / Transaction ID")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    await db.orders.update_one(
        {"id": order_id},
        {
            "$set": {
                "utr": utr,
                "payment_status": "paid",
                "order_status": "preparing",
            }
        },
    )
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return order_doc_to_item(doc)


# ============== SETTINGS ==============
DEFAULT_SETTINGS = {
    "upi_id": "rookhmani@upi",
    "upi_name": "Rookhmani Kandu",
    "upi_qr_image": "https://customer-assets.emergentagent.com/job_fast-food-delivery-27/artifacts/guegeb7z_WhatsApp%20Image%202026-04-28%20at%2011.28.05%20PM.jpeg",
}


async def ensure_settings():
    existing = await db.site_settings.find_one({"key": "site"}, {"_id": 0})
    if not existing:
        await db.site_settings.insert_one({"key": "site", **DEFAULT_SETTINGS})


@api_router.get("/settings")
async def get_settings():
    await ensure_settings()
    doc = await db.site_settings.find_one({"key": "site"}, {"_id": 0})
    return {
        "upi_id": doc.get("upi_id", DEFAULT_SETTINGS["upi_id"]),
        "upi_name": doc.get("upi_name", DEFAULT_SETTINGS["upi_name"]),
        "upi_qr_image": doc.get("upi_qr_image", DEFAULT_SETTINGS["upi_qr_image"]),
    }


@api_router.put("/settings")
async def update_settings(payload: SiteSettingsUpdate):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "Nothing to update")
    await ensure_settings()
    await db.site_settings.update_one({"key": "site"}, {"$set": update_data})
    return await get_settings()


# ============== ADMIN ==============
@api_router.post("/admin/login")
async def admin_login(payload: AdminLoginRequest):
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid password")
    return {"ok": True, "token": "admin-session"}


# ============== SEED ==============
SEED_ITEMS = [
    # Potatoes
    {"name": "Chilli Potato", "category": "potatoes", "veg": True, "price_half": 60, "price_full": 70, "has_variants": True, "image": "https://images.pexels.com/photos/31806278/pexels-photo-31806278.jpeg", "description": "Crispy potatoes tossed in tangy chilli sauce."},
    {"name": "Honey Chilli Potato", "category": "potatoes", "veg": True, "price_half": 70, "price_full": 80, "has_variants": True, "image": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=900", "description": "Sweet and spicy honey-glazed crispy potatoes."},
    {"name": "French Fries", "category": "potatoes", "veg": True, "price_full": 60, "has_variants": False, "image": "https://images.pexels.com/photos/31806278/pexels-photo-31806278.jpeg", "description": "Golden, crisp, salted classic fries."},

    # Rolls
    {"name": "Veg Roll", "category": "rolls", "veg": True, "price_full": 20, "has_variants": False, "image": "https://images.pexels.com/photos/5713744/pexels-photo-5713744.jpeg", "description": "Fresh veggies wrapped in a soft paratha."},
    {"name": "Egg Roll", "category": "rolls", "veg": False, "price_full": 30, "has_variants": False, "image": "https://images.pexels.com/photos/5713744/pexels-photo-5713744.jpeg", "description": "Egg coated paratha with onion & sauces."},
    {"name": "Chicken Roll", "category": "rolls", "veg": False, "price_full": 60, "has_variants": False, "image": "https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg", "description": "Spiced chicken wrapped in soft paratha."},
    {"name": "Single Egg Chicken Roll", "category": "rolls", "veg": False, "price_full": 70, "has_variants": False, "image": "https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg", "description": "Chicken roll with a layer of egg."},
    {"name": "Double Egg Chicken Roll", "category": "rolls", "veg": False, "price_full": 80, "has_variants": False, "image": "https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg", "description": "Chicken roll loaded with double egg."},
    {"name": "Paneer Roll", "category": "rolls", "veg": True, "price_full": 50, "has_variants": False, "image": "https://images.pexels.com/photos/5713744/pexels-photo-5713744.jpeg", "description": "Spiced paneer cubes in a soft wrap."},
    {"name": "Egg Paneer Roll", "category": "rolls", "veg": False, "price_full": 60, "has_variants": False, "image": "https://images.pexels.com/photos/5713744/pexels-photo-5713744.jpeg", "description": "Paneer roll layered with egg."},
    {"name": "Veg Spring Roll", "category": "rolls", "veg": True, "price_half": 30, "price_full": 50, "has_variants": True, "image": "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900", "description": "Crispy fried rolls stuffed with veggies."},
    {"name": "Chicken Spring Roll", "category": "rolls", "veg": False, "price_half": 50, "price_full": 70, "has_variants": True, "image": "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900", "description": "Crispy spring rolls with shredded chicken."},

    # Momos
    {"name": "Veg Steamed Momos", "category": "momos", "veg": True, "price_half": 30, "price_full": 40, "has_variants": True, "image": "https://images.pexels.com/photos/28445589/pexels-photo-28445589.jpeg", "description": "Steamed dumplings with spiced veg filling."},
    {"name": "Chicken Steamed Momos", "category": "momos", "veg": False, "price_half": 40, "price_full": 60, "has_variants": True, "image": "https://images.pexels.com/photos/28445589/pexels-photo-28445589.jpeg", "description": "Juicy chicken-stuffed steamed dumplings."},
    {"name": "Paneer Steamed Momos", "category": "momos", "veg": True, "price_half": 40, "price_full": 60, "has_variants": True, "image": "https://images.pexels.com/photos/28445589/pexels-photo-28445589.jpeg", "description": "Soft paneer-filled steamed dumplings."},
    {"name": "Veg Fried Momos", "category": "momos", "veg": True, "price_half": 40, "price_full": 50, "has_variants": True, "image": "https://images.pexels.com/photos/28445589/pexels-photo-28445589.jpeg", "description": "Crispy fried veg dumplings."},
    {"name": "Paneer Fried Momos", "category": "momos", "veg": True, "price_half": 50, "price_full": 60, "has_variants": True, "image": "https://images.pexels.com/photos/28445589/pexels-photo-28445589.jpeg", "description": "Crispy fried paneer dumplings."},
    {"name": "Chicken Fried Momos", "category": "momos", "veg": False, "price_half": 50, "price_full": 60, "has_variants": True, "image": "https://images.pexels.com/photos/28445589/pexels-photo-28445589.jpeg", "description": "Crispy fried chicken-stuffed dumplings."},

    # Chowmein Veg
    {"name": "Veg Chowmein", "category": "chowmein", "veg": True, "price_half": 50, "price_full": 60, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Wok-tossed noodles with crunchy veggies."},
    {"name": "Singapuri Chowmein", "category": "chowmein", "veg": True, "price_half": 60, "price_full": 70, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Singapore-style spicy curry noodles."},
    {"name": "Chilli Garlic Chowmein", "category": "chowmein", "veg": True, "price_half": 60, "price_full": 70, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Fiery noodles with chilli & garlic kick."},
    {"name": "Hakka Chowmein", "category": "chowmein", "veg": True, "price_half": 60, "price_full": 70, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Classic Indo-Chinese hakka noodles."},
    {"name": "Family Chowmein", "category": "chowmein", "veg": True, "price_full": 200, "has_variants": False, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Family-size platter to share with all."},
    {"name": "Ginger Chowmein", "category": "chowmein", "veg": True, "price_half": 50, "price_full": 60, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Aromatic ginger-tossed noodles."},
    {"name": "Shanghai Chowmein", "category": "chowmein", "veg": True, "price_half": 70, "price_full": 80, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Shanghai-style flavored noodles."},

    # Chowmein Non-Veg
    {"name": "Chicken Chowmein", "category": "chowmein", "veg": False, "price_half": 80, "price_full": 100, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Noodles tossed with juicy chicken strips."},
    {"name": "Chicken Singapuri Chowmein", "category": "chowmein", "veg": False, "price_half": 90, "price_full": 110, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Spicy Singapore-style chicken noodles."},
    {"name": "Chicken Hakka Chowmein", "category": "chowmein", "veg": False, "price_half": 90, "price_full": 110, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Hakka noodles loaded with chicken."},
    {"name": "Chicken Chilli Garlic Chowmein", "category": "chowmein", "veg": False, "price_half": 90, "price_full": 110, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Fiery chilli garlic chicken noodles."},
    {"name": "Egg Chicken Chowmein", "category": "chowmein", "veg": False, "price_half": 90, "price_full": 110, "has_variants": True, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Noodles with egg and chicken."},

    # Rice Veg
    {"name": "Veg Fried Rice", "category": "rice", "veg": True, "price_half": 50, "price_full": 60, "has_variants": True, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", "description": "Wok-fried rice with crunchy vegetables."},
    {"name": "Paneer Fried Rice", "category": "rice", "veg": True, "price_half": 60, "price_full": 70, "has_variants": True, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", "description": "Fried rice loaded with paneer cubes."},
    {"name": "Chilli Garlic Fried Rice", "category": "rice", "veg": True, "price_half": 60, "price_full": 70, "has_variants": True, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", "description": "Spicy chilli garlic-tossed fried rice."},
    {"name": "Single Puri Fried Rice", "category": "rice", "veg": True, "price_half": 60, "price_full": 70, "has_variants": True, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", "description": "Singapore-style fried rice with veggies."},

    # Rice Non-Veg
    {"name": "Chicken Fried Rice", "category": "rice", "veg": False, "price_half": 80, "price_full": 100, "has_variants": True, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", "description": "Fried rice with juicy chicken pieces."},
    {"name": "Chicken Chilli Garlic Fried Rice", "category": "rice", "veg": False, "price_half": 90, "price_full": 110, "has_variants": True, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", "description": "Spicy chilli garlic chicken rice."},
    {"name": "Chicken Singapuri Fried Rice", "category": "rice", "veg": False, "price_half": 90, "price_full": 110, "has_variants": True, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", "description": "Singapore-style chicken fried rice."},
    {"name": "Egg Fried Rice", "category": "rice", "veg": False, "price_half": 60, "price_full": 70, "has_variants": True, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", "description": "Classic egg fried rice."},
    {"name": "Egg & Chicken Fried Rice", "category": "rice", "veg": False, "price_half": 90, "price_full": 110, "has_variants": True, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", "description": "Fried rice with egg & chicken combo."},

    # Main Course Veg
    {"name": "Veg Manchurian", "category": "main-course", "veg": True, "price_half": 60, "price_full": 80, "has_variants": True, "image": "https://images.pexels.com/photos/28674543/pexels-photo-28674543.jpeg", "description": "Veg dumplings in tangy Manchurian sauce."},
    {"name": "Paneer Manchurian", "category": "main-course", "veg": True, "price_half": 100, "price_full": 140, "has_variants": True, "image": "https://images.pexels.com/photos/28674543/pexels-photo-28674543.jpeg", "description": "Paneer cubes in spicy Manchurian gravy."},
    {"name": "Chilli Paneer", "category": "main-course", "veg": True, "price_half": 100, "price_full": 140, "has_variants": True, "image": "https://images.pexels.com/photos/29631461/pexels-photo-29631461.jpeg", "description": "Indo-Chinese spicy chilli paneer."},

    # Main Course Non-Veg
    {"name": "Chilli Chicken", "category": "main-course", "veg": False, "price_half": 100, "price_full": 180, "has_variants": True, "image": "https://images.pexels.com/photos/29631461/pexels-photo-29631461.jpeg", "description": "Spicy Indo-Chinese chilli chicken."},
    {"name": "Chicken Manchurian", "category": "main-course", "veg": False, "price_half": 100, "price_full": 180, "has_variants": True, "image": "https://images.pexels.com/photos/28674543/pexels-photo-28674543.jpeg", "description": "Crispy chicken in Manchurian sauce."},
    {"name": "Chicken Pakora", "category": "main-course", "veg": False, "price_half": 100, "price_full": 140, "has_variants": True, "image": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=900", "description": "Crispy spiced chicken fritters."},
    {"name": "Lemon Chicken", "category": "main-course", "veg": False, "price_full": 100, "has_variants": False, "image": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=900", "description": "Tangy lemon-glazed chicken."},
    {"name": "Crisp Chicken", "category": "main-course", "veg": False, "price_half": 80, "price_full": 250, "has_variants": True, "image": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=900", "description": "Extra crispy fried chicken."},

    # Chopsy
    {"name": "American Chopsuey", "category": "chopsy", "veg": True, "price_full": 90, "has_variants": False, "image": "https://images.pexels.com/photos/9395910/pexels-photo-9395910.jpeg", "description": "Crispy noodles topped with sweet & sour veg gravy."},
]


async def seed_menu_if_empty():
    count = await db.menu_items.count_documents({})
    if count > 0:
        return
    for raw in SEED_ITEMS:
        item = MenuItem(**raw)
        doc = item.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.menu_items.insert_one(doc)
    logging.info("Seeded %d menu items", len(SEED_ITEMS))


@api_router.post("/seed")
async def manual_seed():
    await seed_menu_if_empty()
    count = await db.menu_items.count_documents({})
    return {"seeded": True, "total": count}


@api_router.get("/")
async def root():
    return {"message": "Hot And Tasty Food Shop API"}


# Register router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    try:
        await seed_menu_if_empty()
        await ensure_settings()
    except Exception as e:
        logger.exception("startup error: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
