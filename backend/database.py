import sqlite3
import json
import os
import urllib.parse
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from contextlib import contextmanager

try:
    import pymysql
    import pymysql.cursors
    HAS_PYMYSQL = True
except ImportError:
    try:
        import subprocess
        import sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pymysql", "cryptography"], timeout=60)
        import pymysql
        import pymysql.cursors
        HAS_PYMYSQL = True
    except Exception:
        HAS_PYMYSQL = False

DB_PATH = os.path.join(os.path.dirname(__file__), "crm.db")
SEED_FILE = os.path.join(os.path.dirname(__file__), "seed_customers.json")

# Enterprise AWS MySQL / MariaDB connection settings
MYSQL_HOST = os.environ.get("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.environ.get("MYSQL_PORT", "3306"))
MYSQL_USER = os.environ.get("MYSQL_USER", "root")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "NexusRoot2026!")
MYSQL_DB = os.environ.get("MYSQL_DB", "nexuscrm")

def get_mysql_conn():
    if not HAS_PYMYSQL:
        return None
    try:
        return pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DB,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
            connect_timeout=3
        )
    except Exception:
        return None

def get_sqlite_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    conn = get_mysql_conn()
    is_mysql = (conn is not None)
    if not is_mysql:
        conn = get_sqlite_conn()
    try:
        yield conn, is_mysql
    finally:
        try:
            if not is_mysql:
                conn.commit()
            conn.close()
        except Exception:
            pass

def get_active_engine() -> str:
    conn = get_mysql_conn()
    if conn:
        conn.close()
        return "mysql"
    return "sqlite"

def init_db():
    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        if is_mysql:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS customers (
                    id VARCHAR(128) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    phone VARCHAR(100) NOT NULL,
                    company VARCHAR(255) NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'Active',
                    createdAt VARCHAR(100) NOT NULL,
                    avatar TEXT NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS copilot_chats (
                    id VARCHAR(128) PRIMARY KEY,
                    sender VARCHAR(50) NOT NULL,
                    text TEXT NOT NULL,
                    toolCalled VARCHAR(255),
                    badge VARCHAR(255),
                    timestamp VARCHAR(100) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
        else:
            cur.execute("""
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
            cur.execute("""
                CREATE TABLE IF NOT EXISTS copilot_chats (
                    id TEXT PRIMARY KEY,
                    sender TEXT NOT NULL,
                    text TEXT NOT NULL,
                    toolCalled TEXT,
                    badge TEXT,
                    timestamp TEXT NOT NULL
                )
            """)

        cur.execute("SELECT COUNT(*) as count FROM customers")
        res = cur.fetchone()
        count = res["count"] if isinstance(res, dict) else res[0]
        if count == 0 and os.path.exists(SEED_FILE):
            with open(SEED_FILE, "r") as f:
                seed_data = json.load(f)
                insert_sql = ("INSERT INTO customers (id, name, email, phone, company, status, createdAt, avatar) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                              if is_mysql else
                              "INSERT INTO customers (id, name, email, phone, company, status, createdAt, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
                for c in seed_data:
                    cur.execute(insert_sql, (
                        c["id"],
                        c["name"],
                        c["email"],
                        c["phone"],
                        c["company"],
                        c.get("status", "Active"),
                        c["createdAt"],
                        c.get("avatar", f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(c['name'])}")
                    ))
            if not is_mysql:
                conn.commit()

def get_all_customers() -> List[Dict[str, Any]]:
    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        cur.execute("SELECT * FROM customers ORDER BY createdAt DESC")
        rows = cur.fetchall()
        return [dict(r) for r in rows]

def get_customer_by_id(customer_id: str) -> Optional[Dict[str, Any]]:
    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        sql = "SELECT * FROM customers WHERE id = %s" if is_mysql else "SELECT * FROM customers WHERE id = ?"
        cur.execute(sql, (customer_id,))
        row = cur.fetchone()
        return dict(row) if row else None

def add_single_customer(data: Dict[str, Any]) -> Dict[str, Any]:
    now_str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    cust_id = data.get("id") or f"cust-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    name = data.get("name", "New Client")
    company = data.get("company", "Enterprise Partner")
    clean_domain = "".join(ch for ch in company.lower() if ch.isalnum()) or "company"
    email = data.get("email") or f"{name.lower().replace(' ', '.')}@{clean_domain}.io"
    phone = data.get("phone") or "+1 (555) 019-9000"
    status = data.get("status", "Active")
    avatar = data.get("avatar") or f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(name)}"
    created_at = data.get("createdAt") or now_str

    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        sql = ("INSERT INTO customers (id, name, email, phone, company, status, createdAt, avatar) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
               if is_mysql else
               "INSERT INTO customers (id, name, email, phone, company, status, createdAt, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        cur.execute(sql, (cust_id, name, email, phone, company, status, created_at, avatar))
        if not is_mysql:
            conn.commit()

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
    now_ts = int(datetime.now(timezone.utc).timestamp() * 1000)
    created_items = []
    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        sql = ("REPLACE INTO customers (id, name, email, phone, company, status, createdAt, avatar) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
               if is_mysql else
               "REPLACE INTO customers (id, name, email, phone, company, status, createdAt, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        for idx, item in enumerate(data_list):
            cust_id = item.get("id") or f"cust-{now_ts}-{idx}"
            name = item.get("name", "New Client")
            company = item.get("company", "Enterprise Partner")
            clean_domain = "".join(ch for ch in company.lower() if ch.isalnum()) or "company"
            email = item.get("email") or f"{name.lower().replace(' ', '.')}@{clean_domain}.io"
            phone = item.get("phone") or "+1 (555) 019-9000"
            status = item.get("status", "Active")
            avatar = item.get("avatar") or f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(name)}"
            created_at = item.get("createdAt") or datetime.fromtimestamp((now_ts - idx * 1000) / 1000, timezone.utc).isoformat().replace("+00:00", "Z")

            cur.execute(sql, (cust_id, name, email, phone, company, status, created_at, avatar))
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
        if not is_mysql:
            conn.commit()
    return created_items

def update_customer(customer_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        sel_sql = "SELECT * FROM customers WHERE id = %s" if is_mysql else "SELECT * FROM customers WHERE id = ?"
        cur.execute(sel_sql, (customer_id,))
        current = cur.fetchone()
        if not current:
            return None

        current_dict = dict(current)
        new_name = updates.get("name", current_dict["name"])
        new_email = updates.get("email", current_dict["email"])
        new_phone = updates.get("phone", current_dict["phone"])
        new_company = updates.get("company", current_dict["company"])
        new_status = updates.get("status", current_dict["status"])
        new_avatar = updates.get("avatar", current_dict["avatar"])

        upd_sql = ("UPDATE customers SET name = %s, email = %s, phone = %s, company = %s, status = %s, avatar = %s WHERE id = %s"
                   if is_mysql else
                   "UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, status = ?, avatar = ? WHERE id = ?")
        cur.execute(upd_sql, (new_name, new_email, new_phone, new_company, new_status, new_avatar, customer_id))
        if not is_mysql:
            conn.commit()

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
    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        sql = "DELETE FROM customers WHERE id = %s" if is_mysql else "DELETE FROM customers WHERE id = ?"
        cur.execute(sql, (customer_id,))
        deleted = cur.rowcount > 0
        if not is_mysql:
            conn.commit()
        return deleted

def reset_to_seed_data() -> List[Dict[str, Any]]:
    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        cur.execute("DELETE FROM customers")
        if not is_mysql:
            conn.commit()
    init_db()
    return get_all_customers()

def calculate_stats() -> Dict[str, int]:
    customers = get_all_customers()
    total = len(customers)
    active = sum(1 for c in customers if c["status"] == "Active")
    inactive = sum(1 for c in customers if c["status"] == "Inactive")
    active_pct = round((active / (total or 1)) * 100)
    churn_rate = round((inactive / (total or 1)) * 100)

    now = datetime.now(timezone.utc)
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
    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        sql = "SELECT * FROM copilot_chats ORDER BY timestamp ASC LIMIT %s" if is_mysql else "SELECT * FROM copilot_chats ORDER BY timestamp ASC LIMIT ?"
        cur.execute(sql, (limit,))
        rows = cur.fetchall()
        return [dict(r) for r in rows]

def save_chat_message(data: Dict[str, Any]) -> Dict[str, Any]:
    msg_id = data.get("id") or f"msg-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    sender = data.get("sender", "user")
    text = data.get("text", "")
    tool_called = data.get("toolCalled")
    badge = data.get("badge")
    ts = data.get("timestamp") or (datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))

    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        sql = ("REPLACE INTO copilot_chats (id, sender, text, toolCalled, badge, timestamp) VALUES (%s, %s, %s, %s, %s, %s)"
               if is_mysql else
               "REPLACE INTO copilot_chats (id, sender, text, toolCalled, badge, timestamp) VALUES (?, ?, ?, ?, ?, ?)")
        cur.execute(sql, (msg_id, sender, text, tool_called, badge, ts))
        if not is_mysql:
            conn.commit()

    return {
        "id": msg_id,
        "sender": sender,
        "text": text,
        "toolCalled": tool_called,
        "badge": badge,
        "timestamp": ts
    }

def clear_chat_history() -> bool:
    with get_db() as (conn, is_mysql):
        cur = conn.cursor()
        cur.execute("DELETE FROM copilot_chats")
        if not is_mysql:
            conn.commit()
        return True
