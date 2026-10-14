import sqlite3
import json
import os
import urllib.parse
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "crm.db")
SEED_FILE = os.path.join(os.path.dirname(__file__), "seed_customers.json")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            company TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Active',
            createdAt TEXT NOT NULL,
            avatar TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS copilot_chats (
            id TEXT PRIMARY KEY,
            sender TEXT NOT NULL,
            text TEXT NOT NULL,
            toolCalled TEXT,
            badge TEXT,
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()

    # Check if empty, populate with seed data
    cursor.execute("SELECT COUNT(*) as count FROM customers")
    count = cursor.fetchone()["count"]
    if count == 0 and os.path.exists(SEED_FILE):
        with open(SEED_FILE, "r") as f:
            seed_data = json.load(f)
            for c in seed_data:
                cursor.execute("""
                    INSERT INTO customers (id, name, email, phone, company, status, createdAt, avatar)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    c["id"],
                    c["name"],
                    c["email"],
                    c["phone"],
                    c["company"],
                    c.get("status", "Active"),
                    c["createdAt"],
                    c.get("avatar", f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(c['name'])}")
                ))
        conn.commit()
    conn.close()

def get_all_customers() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers ORDER BY datetime(createdAt) DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_customer_by_id(customer_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def add_single_customer(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.utcnow().isoformat() + "Z"
    cust_id = data.get("id") or f"cust-{int(datetime.utcnow().timestamp() * 1000)}"
    name = data.get("name", "New Client")
    company = data.get("company", "Enterprise Partner")
    clean_domain = "".join(ch for ch in company.lower() if ch.isalnum()) or "company"
    email = data.get("email") or f"{name.lower().replace(' ', '.')}@{clean_domain}.io"
    phone = data.get("phone") or "+1 (555) 019-9000"
    status = data.get("status", "Active")
    avatar = data.get("avatar") or f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(name)}"
    created_at = data.get("createdAt") or now_str

    cursor.execute("""
        INSERT INTO customers (id, name, email, phone, company, status, createdAt, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (cust_id, name, email, phone, company, status, created_at, avatar))
    conn.commit()
    conn.close()
    return {
        "id": cust_id,
        "name": name,
        "email": email,
        "phone": phone,
        "company": company,
        "status": status,
        "createdAt": created_at,
        "avatar": avatar
    }

def add_bulk_customers(data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    now_ts = int(datetime.utcnow().timestamp() * 1000)
    created_items = []

    for idx, item in enumerate(data_list):
        cust_id = item.get("id") or f"cust-{now_ts}-{idx}"
        name = item.get("name", "New Client")
        company = item.get("company", "Enterprise Partner")
        clean_domain = "".join(ch for ch in company.lower() if ch.isalnum()) or "company"
        email = item.get("email") or f"{name.lower().replace(' ', '.')}@{clean_domain}.io"
        phone = item.get("phone") or "+1 (555) 019-9000"
        status = item.get("status", "Active")
        avatar = item.get("avatar") or f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(name)}"
        created_at = item.get("createdAt") or datetime.utcfromtimestamp((now_ts - idx * 1000) / 1000).isoformat() + "Z"

        cursor.execute("""
            INSERT OR REPLACE INTO customers (id, name, email, phone, company, status, createdAt, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (cust_id, name, email, phone, company, status, created_at, avatar))

        created_items.append({
            "id": cust_id,
            "name": name,
            "email": email,
            "phone": phone,
            "company": company,
            "status": status,
            "createdAt": created_at,
            "avatar": avatar
        })

    conn.commit()
    conn.close()
    return created_items

def update_customer(customer_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
    current = cursor.fetchone()
    if not current:
        conn.close()
        return None

    current_dict = dict(current)
    new_name = updates.get("name", current_dict["name"])
    new_email = updates.get("email", current_dict["email"])
    new_phone = updates.get("phone", current_dict["phone"])
    new_company = updates.get("company", current_dict["company"])
    new_status = updates.get("status", current_dict["status"])
    new_avatar = updates.get("avatar", current_dict["avatar"])

    cursor.execute("""
        UPDATE customers
        SET name = ?, email = ?, phone = ?, company = ?, status = ?, avatar = ?
        WHERE id = ?
    """, (new_name, new_email, new_phone, new_company, new_status, new_avatar, customer_id))
    conn.commit()
    conn.close()

    current_dict.update({
        "name": new_name,
        "email": new_email,
        "phone": new_phone,
        "company": new_company,
        "status": new_status,
        "avatar": new_avatar
    })
    return current_dict

def delete_customer(customer_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM customers WHERE id = ?", (customer_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def reset_to_seed_data() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM customers")
    conn.commit()
    conn.close()
    init_db()
    return get_all_customers()

def calculate_stats() -> Dict[str, int]:
    customers = get_all_customers()
    total = len(customers)
    active = sum(1 for c in customers if c["status"] == "Active")
    inactive = sum(1 for c in customers if c["status"] == "Inactive")
    active_pct = round((active / (total or 1)) * 100)
    churn_rate = round((inactive / (total or 1)) * 100)

    now = datetime.utcnow()
    new_this_month = 0
    for c in customers:
        try:
            dt = datetime.fromisoformat(c["createdAt"].replace("Z", "+00:00"))
            if dt.year == now.year and dt.month == now.month:
                new_this_month += 1
        except Exception:
            pass

    return {
        "total": total,
        "active": active,
        "inactive": inactive,
        "activePercentage": active_pct,
        "churnRate": churn_rate,
        "newThisMonth": new_this_month or round(total * 0.35)
    }

def get_chat_history(limit: int = 100) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM copilot_chats
        ORDER BY datetime(timestamp) ASC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def save_chat_message(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    msg_id = data.get("id") or f"msg-{int(datetime.utcnow().timestamp() * 1000)}"
    sender = data.get("sender", "user")
    text = data.get("text", "")
    tool_called = data.get("toolCalled")
    badge = data.get("badge")
    ts = data.get("timestamp") or (datetime.utcnow().isoformat() + "Z")

    cursor.execute("""
        INSERT OR REPLACE INTO copilot_chats (id, sender, text, toolCalled, badge, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (msg_id, sender, text, tool_called, badge, ts))
    conn.commit()
    conn.close()
    return {
        "id": msg_id,
        "sender": sender,
        "text": text,
        "toolCalled": tool_called,
        "badge": badge,
        "timestamp": ts
    }

def clear_chat_history() -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM copilot_chats")
    conn.commit()
    conn.close()
    return True

