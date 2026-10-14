import re
import urllib.parse
from datetime import datetime
from typing import Optional, Any, List, Dict
from fastapi import APIRouter
from backend.models import CopilotChatRequest, CopilotChatResponse, ChatMessageModel
from backend.database import (
    get_all_customers,
    add_single_customer,
    add_bulk_customers,
    update_customer,
    delete_customer,
    reset_to_seed_data,
    calculate_stats,
    get_chat_history,
    save_chat_message,
    clear_chat_history
)

router = APIRouter(prefix="/api/copilot", tags=["copilot"])

@router.get("/history")
def get_copilot_history(limit: int = 100):
    return {"messages": get_chat_history(limit)}

@router.post("/history")
def save_copilot_history(msg: ChatMessageModel):
    saved = save_chat_message(msg.dict())
    return {"status": "saved", "message": saved}

@router.delete("/history")
def clear_copilot_history():
    clear_chat_history()
    return {"status": "cleared"}


BULK_PROFILES = [
    {"name": "Liam O'Connor", "company": "Dublin Aerotech", "phone": "+353 (1) 496-0123", "domain": "dublinaerotech.ie"},
    {"name": "Priya Patel", "company": "Astraea FinTech", "phone": "+91 (22) 6789-0123", "domain": "astraeafin.in"},
    {"name": "Mateo Rossi", "company": "Milano Cybernetics", "phone": "+39 (02) 8901-2345", "domain": "milanocyber.it"},
    {"name": "Zara Al-Mansoor", "company": "Emirates Cloud Logistics", "phone": "+971 (4) 312-7890", "domain": "emiratescloud.ae"},
    {"name": "Kenji Sato", "company": "Kyoto Quantum Systems", "phone": "+81 (75) 746-8901", "domain": "kyotoquantum.jp"},
    {"name": "Elena Rostova", "company": "Nordic BioSensors", "phone": "+46 (8) 123-4567", "domain": "nordicbiosensors.se"},
    {"name": "Carlos Mendoza", "company": "Valparaiso Lithium Labs", "phone": "+56 (32) 234-5678", "domain": "valparaisolithium.cl"},
    {"name": "Amara Okafor", "company": "Lagos Fintech Frontier", "phone": "+234 (1) 234-5678", "domain": "lagosfrontier.ng"},
    {"name": "Lucas Lindqvist", "company": "Helsinki CleanTech", "phone": "+358 (9) 456-7890", "domain": "helsinkicleantech.fi"},
    {"name": "Siddharth Rao", "company": "Bangalore Cloud Grid", "phone": "+91 (80) 4123-4567", "domain": "cloudgrid.in"}
]

WORD_NUM_MAP = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'fifteen': 15, 'twenty': 20,
    'twenty-five': 25, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'dus': 10, 'das': 10, 'paanch': 5, 'panch': 5, 'do': 2, 'teen': 3, 'char': 4
}

def convert_to_point_to_point(text: str) -> str:
    if not text:
        return ""
    text = text.replace("*", "").strip()
    raw_lines = [l.strip() for l in text.split("\n") if l.strip()]

    numbered_lines = [l for l in raw_lines if re.match(r'^\d+[\.\)]\s', l)]
    if len(numbered_lines) >= 2:
        pts = []
        c = 1
        for l in raw_lines:
            if re.match(r'^\d+[\.\)]\s', l):
                content = re.sub(r'^\d+[\.\)]\s*', '', l)
                pts.append(f"{c}. {content}")
                c += 1
            elif l.endswith(':'):
                continue
            else:
                pts.append(f"{c}. {l}")
                c += 1
        return "\n".join(pts)

    ratio_m = re.search(r'ratio(?:\s+of\s+[a-z\s]+)?\s+is\s+(\d+:\d+)(?:\s+\((?:approximately\s+)?([0-9.]+:\d+)\))?', text, re.IGNORECASE) or re.search(r'live ratio\s+(\d+:\d+)', text, re.IGNORECASE) or re.search(r'(\d+:\d+)', text)
    if ratio_m and ('ratio' in text.lower() or 'anupat' in text.lower()):
        active_m = re.search(r'(\d+)\s+active', text, re.IGNORECASE)
        inactive_m = re.search(r'(\d+)\s+inactive', text, re.IGNORECASE)
        total_m = re.search(r'(\d+)\s+(?:total|enterprise)', text, re.IGNORECASE)
        pts = [f"1. Live Ratio: {ratio_m.group(1)}"]
        if active_m:
            pts.append(f"2. Active Accounts: {active_m.group(1)} accounts")
        if inactive_m:
            pts.append(f"3. Inactive Accounts: {inactive_m.group(1)} accounts")
        if total_m:
            pts.append(f"4. Total Portfolio: {total_m.group(1)} accounts")
        if len(pts) >= 3:
            return "\n".join(pts)

    clean_str = " ".join(raw_lines)
    sentences = [s.strip() for s in re.split(r'(?<=[.?!])\s+(?=[A-Z0-9\u0900-\u097F])', clean_str) if s.strip()]

    if len(sentences) <= 1 and ":" in clean_str and len(clean_str) > 35:
        head, tail = clean_str.split(":", 1)
        sub_parts = [head.strip()] + [p.strip() for p in re.split(r'(?:,\s+and\s+|,\s+aur\s+|;\s*|,\s+while\s+)', tail) if p.strip()]
        if len(sub_parts) >= 2:
            sentences = sub_parts

    pts = []
    c = 1
    for s in sentences:
        s = re.sub(r'^(?:Namaste!\s*|Hello!\s*|Hey there!\s*|Haan,\s*bilkul!\s*|Yes,\s*absolutely!\s*|Zabardast!\s*|Awesome!\s*)', '', s, flags=re.IGNORECASE).strip()
        if not s:
            continue
        pts.append(f"{c}. {s}")
        c += 1

    if not pts:
        return f"1. {clean_str}"
    return "\n".join(pts)

def clean_text(text: str) -> str:
    text = text.replace("*", "")
    text = re.sub(r'\b(my\s+friend|dear\s+friend|friend|dost)\b', '', text, flags=re.IGNORECASE)
    return text.strip()

@router.post("/chat", response_model=CopilotChatResponse)
def copilot_chat_endpoint(payload: CopilotChatRequest):
    query = payload.message.strip()
    norm = query.lower()
    is_hindi = bool(re.search(r'\b(hai|hain|kya|kitna|kitne|kaise|karo|batao|karen|nahi|acha|shukriya|namaste|jodo|naye|naya|aur|farq|antar|hisab)\b', norm))

    # Persist user incoming message
    save_chat_message({"sender": "user", "text": query})

    def respond(text: str, toolCalled: Optional[str] = None, badge: Optional[str] = None, data: Optional[Any] = None) -> CopilotChatResponse:
        cleaned = clean_text(text)
        save_chat_message({"sender": "agent", "text": cleaned, "toolCalled": toolCalled, "badge": badge})
        return CopilotChatResponse(text=cleaned, toolCalled=toolCalled, badge=badge, data=data)

    # 0. CONVERSATIONAL MEMORY & RECALL
    is_memory_check = bool(re.search(r'\b(remember|yaad|memory|purani chats?|old chats?|previous chats?|history)\b', norm)) and bool(re.search(r'\b(kya|do you|can you|hai|rakhte)\b', norm))
    if is_memory_check:
        txt = (
            "Haan, bilkul! Main aapki saari purani chats aur conversation history ko yaad rakhta hoon. Saare messages SQLite database aur local cache me save rehte hain, jisse aapka context kabhi lose nahi hota."
            if is_hindi else
            "Yes, absolutely! I retain our full chat history and maintain conversation memory. All exchanges are persisted in our SQLite database and local cache so your business context is always preserved."
        )
        return respond(txt, toolCalled="explain_crm_concept", badge="Memory: Active")

    is_last_question_query = bool(re.search(r'\b(pehle kya|pichla sawal|last question|what did i ask|previous question|maine kya pucha|last message)\b', norm))
    if is_last_question_query:
        history = payload.history or get_chat_history()
        last_user_msg = None
        for m in reversed(history):
            m_text = m.get("text") or m.get("message") or ""
            m_sender = m.get("sender") or ""
            if m_sender == "user" and m_text.strip() != query.strip():
                last_user_msg = m_text.strip()
                break
        if last_user_msg:
            txt = (
                f"Aapne pichli baar yeh pucha tha: \"{last_user_msg}\"."
                if is_hindi else
                f"Your previous question was: \"{last_user_msg}\"."
            )
        else:
            txt = (
                "Yeh hamari is session ki pehli query hai. Aap jo bhi puchenge, main use conversation memory me yaad rakhunga."
                if is_hindi else
                "This is our first query in this session. Every question you ask is retained in our active conversation history."
            )
        return respond(txt, toolCalled="explain_crm_concept", badge="Recall: Previous Query")

    # 0.6 HOW TO CHECK / TEST CHATBOT FUNCTIONING
    is_test_guide = (
        (bool(re.search(r'\b(check|test|functioning|verify|kaise check|kaise test)\b', norm)) and
         bool(re.search(r'\b(chatbot|copilot|bot|assistant|ai)\b', norm))) or
        'how to check' in norm or 'how can i check' in norm or 'test my chatbot' in norm or 'test chatbot' in norm or 'chatbot functioning' in norm
    )
    if is_test_guide:
        txt = (
            "Aap metrics (jaise 'What is the ratio?'), customer search (jaise 'Who is Sarah?'), ya mutation ('Make Marcus inactive') test kar sakte hain."
            if is_hindi else
            "You can test queries like 'What is the ratio?', search 'Who is Sarah?', or update 'Make Marcus inactive'."
        )
        return respond(txt, toolCalled="explain_crm_concept", badge="Test Guide")

    # 0.7 GREETINGS & SMALL TALK
    is_greeting = bool(re.search(r'^(hi|hello|hey|greetings|namaste|good\s+(morning|afternoon|evening))\b', norm)) or norm in ['hi', 'hello', 'hey']
    if is_greeting:
        txt = (
            "Namaste! Main aapki kya madad karoon?"
            if is_hindi else
            "Hello! How can I help you today?"
        )
        return respond(txt, toolCalled="explain_crm_concept", badge="Nexus AI: Hello!")

    is_how_are_you = bool(re.search(r'\b(how are you|how r u|kaise ho|kya haal)\b', norm))
    if is_how_are_you:
        txt = (
            "Main badhiya hoon, shukriya! Main aapki kya madad karoon?"
            if is_hindi else
            "I'm doing well, thank you! How can I help you today?"
        )
        return respond(txt, toolCalled="explain_crm_concept", badge="Nexus AI: Doing Great!")

    is_what_is_crm = bool(re.search(r'\b(what is crm|crm kya hai|crm kya hota)\b', norm))
    if is_what_is_crm:
        txt = (
            "CRM (Customer Relationship Management) ek software platform hai jisse customer data, sales pipelines aur client retention ko manage kiya jata hai."
            if is_hindi else
            "CRM (Customer Relationship Management) is software used to manage customer data, track sales pipelines, and prevent customer churn."
        )
        return respond(txt, toolCalled="explain_crm_concept", badge="Concept: CRM")

    customers = get_all_customers()

    # Customer direct lookup (e.g. "who is Marcus", "Sarah's email")
    if bool(re.search(r'\b(who is|tell me about|contact for|email of|phone of|info on)\b', norm)) or ('who' in norm and len(norm.split()) <= 4):
        for c in customers:
            first_name = c["name"].split()[0].lower()
            if c["name"].lower() in norm or (len(first_name) >= 3 and first_name in norm):
                txt = (
                    f"{c['name']} is an {c['status']} customer at {c['company']} (Email: {c['email']}, Phone: {c['phone']})."
                )
                return respond(txt, toolCalled="fetch_customer_profile", badge=f"Profile: {c['name']}", data=c)
    stats = calculate_stats()
    total = stats["total"]
    active = stats["active"]
    inactive = stats["inactive"]
    churn_rate = stats["churnRate"]
    retention_rate = stats["activePercentage"]

    # 1. WHAT-IF / HYPOTHETICAL SIMULATIONS
    is_what_if = bool(re.search(r'\b(if|agar|what if|suppose|maan lo)\b', norm)) and bool(re.search(r'\b(churn|active|inactive|rate|add|jode|badh|ghat)\b', norm))

    if is_what_if:
        num_match = re.search(r'\b(\d+)\b', norm)
        hyp_count = int(num_match.group(1)) if num_match else 5
        is_adding = bool(re.search(r'\b(add|naye|new|jode|onboard|increase|badh)\b', norm))

        if is_adding:
            proj_total = total + hyp_count
            proj_active = active + hyp_count
            proj_churn = round((inactive / (proj_total or 1)) * 100)
            proj_active_pct = round((proj_active / (proj_total or 1)) * 100)
            txt = (
                f"Calculated Scenario: Agar hum {hyp_count} naye active customers jodte hain, to total accounts {total} se badhkar {proj_total} ho jayenge. Active accounts {proj_active} ({proj_active_pct}%) ho jayenge, aur projected churn rate {churn_rate}% se ghatkar {proj_churn}% par aa jayega."
                if is_hindi else
                f"Calculated Scenario: If we add {hyp_count} new active customers, total accounts will increase from {total} to {proj_total}. Active accounts will reach {proj_active} ({proj_active_pct}%), and the projected churn rate will drop from {churn_rate}% down to {proj_churn}%."
            )
            return respond(txt, toolCalled="get_portfolio_summary", badge=f"Projected Churn: {proj_churn}%")
        else:
            proj_active = max(0, active - hyp_count)
            proj_inactive = inactive + hyp_count
            proj_churn = round((proj_inactive / (total or 1)) * 100)
            proj_active_pct = round((proj_active / (total or 1)) * 100)
            txt = (
                f"Calculated Scenario: Agar {hyp_count} active accounts churn (inactive) ho jaate hain, to active accounts {active} se ghatkar {proj_active} ({proj_active_pct}%) ho jayenge, inactive accounts badhkar {proj_inactive} ho jayenge, aur projected churn rate {churn_rate}% se badhkar {proj_churn}% ho jayega."
                if is_hindi else
                f"Calculated Scenario: If {hyp_count} active accounts were to churn into inactive status, active accounts would drop from {active} to {proj_active} ({proj_active_pct}%), inactive accounts would rise to {proj_inactive}, and the projected churn rate would increase from {churn_rate}% to {proj_churn}%."
            )
            return respond(txt, toolCalled="get_portfolio_summary", badge=f"Projected Churn: {proj_churn}%")

    # 2. BULK / SINGLE CUSTOMER ADDITION
    is_add_customer = (
        not is_what_if and
        bool(re.search(r'\b(add|create|new|naya|naye|jodo|banao|generate|insert)\b', norm)) and
        bool(re.search(r'\b(customers?|clients?|accounts?|leads?|users?)\b', norm)) and
        'how to add' not in norm and 'kaise add' not in norm
    )
    if is_add_customer:
        count_match = (
            re.search(r'\b(\d+)\s*(?:new\s+|naye?\s+|more\s+|aur\s+|enterprise\s+)?(?:customers?|clients?|accounts?|leads?)', norm) or
            re.search(r'(?:customers?|clients?|accounts?|leads?)\s*(?:add|create|jodo)?\s*(\d+)\b', norm) or
            re.search(r'\b(?:add|create|jodo|generate)\s+(\d+)\b', norm) or
            re.search(r'\b(one|two|three|four|five|six|seven|eight|nine|ten|twenty|fifty|dus|das|paanch|panch)\s+(?:new\s+|naye?\s+)?(?:customers?|clients?|accounts?)', norm)
        )
        req_count = 1
        if count_match:
            raw_c = count_match.group(1).lower()
            req_count = int(raw_c) if raw_c.isdigit() else WORD_NUM_MAP.get(raw_c, 1)

        if req_count > 1:
            target_count = min(req_count, 50)
            now_ts = int(datetime.utcnow().timestamp() * 1000)
            batch = []
            for i in range(target_count):
                tmpl = BULK_PROFILES[i % len(BULK_PROFILES)]
                cycle = i // len(BULK_PROFILES)
                name = f"{tmpl['name']} {cycle + 1}" if cycle > 0 else tmpl["name"]
                company = f"{tmpl['company']} Division {cycle + 1}" if cycle > 0 else tmpl["company"]
                clean_name = re.sub(r'[^a-z0-9]', '.', name.lower())
                batch.append({
                    "id": f"cust-{now_ts}-{i}",
                    "name": name,
                    "company": company,
                    "email": f"{clean_name}@{tmpl['domain']}",
                    "phone": tmpl["phone"],
                    "status": "Active",
                    "createdAt": datetime.utcnow().isoformat() + "Z",
                    "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(name)}"
                })
            added = add_bulk_customers(batch)
            preview = ", ".join(f"{c['name']} ({c['company']})" for c in added[:5])
            extra = f", and {len(added) - 5} more" if len(added) > 5 else ""
            txt = (
                f"Maine {len(added)} naye customers directory me add kar diye hain: {preview}{extra}. Sabhi accounts active hain aur live metrics me sync ho gaye hain!"
                if is_hindi else
                f"I have added {len(added)} new enterprise customer accounts to your directory: {preview}{extra}. All {len(added)} accounts are now Active and reflected across your metrics."
            )
            return respond(txt, toolCalled="add_customer", badge=f"Added {len(added)} Customers", data=added)
        else:
            raw_match = re.search(r'(?:add|create|new customer|naya customer)\s+(?:customer\s+|client\s+)?([A-Za-z\s]+?)(?:\s+(?:at|from|with|company)\s+([A-Za-z0-9&.\s]+))?$', query, re.IGNORECASE)
            name = raw_match.group(1).strip() if raw_match and raw_match.group(1) else "New Client"
            company = raw_match.group(2).strip() if raw_match and raw_match.group(2) else "Enterprise Partner"
            email = f"{name.lower().replace(' ', '.')}@{re.sub(r'[^a-z0-9]', '', company.lower()) or 'company'}.io"
            new_c = add_single_customer({
                "name": name,
                "company": company,
                "email": email,
                "status": "Active"
            })
            txt = (
                f"Zabardast! Maine {name} ({company}) ko directory me add kar diya hai aur status Active kar diya hai (Email: {email}). Live dashboard me numbers sync ho gaye hain!"
                if is_hindi else
                f"Awesome! I just added {name} ({company}) to your directory with email {email}. The account is now Active and synced across all your metrics."
            )
            return respond(txt, toolCalled="add_customer", badge=f"Added {name} ({company})", data=new_c)

    # 3. RATIOS & PROPORTIONS
    if 'ratio' in norm or 'anupat' in norm:
        ratio_dec = f"{active / (inactive or 1):.2f}"
        txt = (
            f"Active aur inactive accounts ka ratio {active}:{inactive} ({ratio_dec}:1) hai."
            if is_hindi else
            f"The ratio of active to inactive accounts is {active}:{inactive} ({ratio_dec}:1)."
        )
        return respond(txt, toolCalled="get_portfolio_summary", badge=f"Ratio: {active}:{inactive}")

    # 4. DIFFERENCE / GAP
    if bool(re.search(r'\b(difference|gap|farq|antar|minus)\b', norm)) and bool(re.search(r'\b(active|inactive)\b', norm)):
        diff = abs(active - inactive)
        txt = (
            f"Active aur inactive accounts ke beech {diff} accounts ka antar (gap) hai. Live database me {active} active aur {inactive} inactive accounts hain."
            if is_hindi else
            f"The numerical difference between active and inactive accounts is {diff}. Currently there are {active} active and {inactive} inactive accounts."
        )
        return respond(txt, toolCalled="get_portfolio_summary", badge=f"Diff: {diff} Accounts")

    # 5. UNIQUE COMPANIES & TOP COMPANY
    if bool(re.search(r'\b(companies|organizations|firms)\b', norm)) and bool(re.search(r'\b(unique|distinct|total|how many|kitni|kitne|sankhya|count|most|highest|top|breakdown)\b', norm)):
        comp_map = {}
        for c in customers:
            comp_map[c["company"]] = comp_map.get(c["company"], 0) + 1
        unique_cnt = len(comp_map)
        sorted_comps = sorted(comp_map.items(), key=lambda x: x[1], reverse=True)
        top = sorted_comps[0] if sorted_comps else ("None", 0)

        if bool(re.search(r'\b(most|highest|maximum|top|sabse zyada)\b', norm)):
            txt = (
                f"Database calculation: Sabse zyada customer accounts {top[0]} ke sath hain ({top[1]} accounts). Kul {unique_cnt} unique companies registered hain."
                if is_hindi else
                f"Database calculation: The organization with the most customer accounts is {top[0]} with {top[1]} account(s). Across {unique_cnt} unique companies."
            )
            return respond(txt, toolCalled="get_portfolio_summary", badge=f"Top Org: {top[0]}")
        else:
            txt = (
                f"NexusCRM me kul {unique_cnt} unique enterprise organizations hain, jinke sath hamare {total} customer accounts registered hain."
                if is_hindi else
                f"NexusCRM currently tracks accounts across {unique_cnt} unique enterprise organizations, encompassing all {total} customer records."
            )
            return respond(txt, toolCalled="get_portfolio_summary", badge=f"Companies: {unique_cnt}")

    # 6. MONTHLY ONBOARDING
    if bool(re.search(r'\b(month|monthly|mahina|mahine|october|september|august)\b', norm)) and bool(re.search(r'\b(breakdown|count|how many|kitne|added|onboarded)\b', norm)):
        month_match = re.search(r'\b(january|february|march|april|may|june|july|august|september|october|november|december)\b', norm)
        if month_match:
            t_month = month_match.group(1).capitalize()
            cnt = sum(1 for c in customers if t_month.lower() in c.get("createdAt", "").lower())
            pct = round((cnt / (total or 1)) * 100)
            txt = (
                f"{t_month} me kul {cnt} customer accounts add hue the, jo total portfolio ({total}) ka {pct}% hai."
                if is_hindi else
                f"In {t_month}, exactly {cnt} customer accounts were added, representing {pct}% of our current {total} enterprise accounts."
            )
            return respond(txt, toolCalled="get_portfolio_summary", badge=f"{t_month}: {cnt}")

    # 7. CHURN RATE (DIRECT)
    if 'churn' in norm and ('rate' in norm or 'kya' in norm or 'kitna' in norm or 'what is' in norm):
        txt = (
            f"Aapka live churn rate abhi {churn_rate}% hai, jisme kul {total} me se {inactive} accounts inactive hain."
            if is_hindi else
            f"Your live churn rate is currently {churn_rate}%, with {inactive} out of {total} enterprise accounts inactive."
        )
        return respond(txt, toolCalled="explain_crm_concept", badge=f"Churn Rate: {churn_rate}%")

    # 8. RETENTION RATE (DIRECT)
    if 'retention' in norm and ('rate' in norm or 'kya' in norm or 'kitna' in norm or 'what is' in norm):
        txt = (
            f"Aapka live retention rate abhi {retention_rate}% hai, jisme kul {total} me se {active} accounts active hain."
            if is_hindi else
            f"Your live retention rate is currently {retention_rate}%, with {active} out of {total} enterprise accounts active."
        )
        return respond(txt, toolCalled="explain_crm_concept", badge=f"Retention: {retention_rate}%")

    # 9. GENERAL COUNTS & DEFAULTS
    if bool(re.search(r'\b(how many|count|kitne|kitna)\b', norm)):
        if 'active' in norm and 'inactive' not in norm:
            txt = f"You currently have {active} active customer accounts, representing {retention_rate}% of your total {total} portfolio."
            return respond(txt, toolCalled="get_portfolio_summary", badge=f"Active: {active}")
        if 'inactive' in norm:
            txt = f"Right now you have {inactive} inactive customer accounts ({churn_rate}% churn risk) out of {total} total accounts."
            return respond(txt, toolCalled="get_portfolio_summary", badge=f"Inactive: {inactive}")

    txt = (
        f"NexusCRM me abhi kul {total} enterprise accounts hain: {active} active ({retention_rate}%) aur {inactive} inactive ({churn_rate}%)."
        if is_hindi else
        f"NexusCRM is currently tracking {total} enterprise accounts for us: {active} active ({retention_rate}%) and {inactive} inactive ({churn_rate}%)."
    )
    return respond(txt, toolCalled="get_portfolio_summary", badge=f"Total: {total}")

