from sqlalchemy import Column, Integer, String, Boolean, Enum
import enum
from app.core.database import Base

class RoleEnum(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class AdminRoleEnum(str, enum.Enum):
    LIBRARY = "library_admin"
    ACCOUNTS = "accounts_admin"
    LAB = "lab_admin"
    DEPARTMENT = "department_admin"
    HOSTEL = "hostel_admin"
    NONE = "none"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=RoleEnum.STUDENT.value)
    
    # Specific to admins
    admin_type = Column(String, default=AdminRoleEnum.NONE.value)
    
    # Profile fields (mainly for students)
    full_name = Column(String, nullable=True)
    roll_number = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True)
    batch = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    id_card_url = Column(String, nullable=True)
    
    is_profile_complete = Column(Boolean, default=False)
