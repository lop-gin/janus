from pydantic import BaseModel

class Address(BaseModel):
    """Model for customer billing address."""
    street: str
    city: str
    state: str
    zipCode: str
    country: str