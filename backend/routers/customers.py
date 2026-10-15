from fastapi import APIRouter, HTTPException, status
from typing import List, Union, Dict, Any
try:
    from backend.models import CustomerModel, CustomerCreate, CustomerUpdate
    from backend.database import (
        get_all_customers,
        get_customer_by_id,
        add_single_customer,
        add_bulk_customers,
        update_customer,
        delete_customer,
        reset_to_seed_data
    )
except ImportError:
    from models import CustomerModel, CustomerCreate, CustomerUpdate
    from database import (
        get_all_customers,
        get_customer_by_id,
        add_single_customer,
        add_bulk_customers,
        update_customer,
        delete_customer,
        reset_to_seed_data
    )

router = APIRouter(prefix="/api/customers", tags=["customers"])

@router.get("", response_model=List[CustomerModel])
def read_customers():
    return get_all_customers()

@router.get("/{customer_id}", response_model=CustomerModel)
def read_customer(customer_id: str):
    customer = get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("", status_code=status.HTTP_201_CREATED)
def create_customer_endpoint(payload: Union[CustomerCreate, List[CustomerCreate]]):
    if isinstance(payload, list):
        items = [p.model_dump(exclude_none=True) for p in payload]
        return add_bulk_customers(items)
    else:
        return add_single_customer(payload.model_dump(exclude_none=True))

@router.put("/{customer_id}", response_model=CustomerModel)
def update_customer_endpoint(customer_id: str, payload: CustomerUpdate):
    updated = update_customer(customer_id, payload.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated

@router.delete("/{customer_id}")
def delete_customer_endpoint(customer_id: str):
    success = delete_customer(customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"status": "success", "message": f"Customer {customer_id} deleted"}

@router.post("/reset", response_model=List[CustomerModel])
def reset_customers_endpoint():
    return reset_to_seed_data()
