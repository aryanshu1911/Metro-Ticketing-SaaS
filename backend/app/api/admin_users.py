from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from ..database.db import get_db
from ..utils.admin_auth import get_current_admin, require_mfa
from ..models.user import User
from ..models.admin import AuditLog

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])

@router.get("/")
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    from sqlalchemy import or_
    query = db.query(User).filter(or_(User.is_deleted == False, User.is_deleted == None))
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    return {"users": users, "total": total}

@router.delete("/{user_id}")
def soft_delete_user(
    user_id: str, 
    db: Session = Depends(get_db), 
    admin=Depends(get_current_admin),
    mfa=Depends(require_mfa) # Critical action requires MFA
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found or already deleted")
    
    user.is_deleted = True
    user.deleted_at = func.now()
    
    # Write Audit Log
    audit = AuditLog(admin_id=admin.id, action="soft_delete", entity_type="user", entity_id=str(user.id))
    db.add(audit)
    db.commit()
    
    return {"msg": "User soft deleted successfully", "user_id": user_id}

@router.post("/{user_id}/ban")
def ban_user(
    user_id: str, 
    db: Session = Depends(get_db), 
    admin=Depends(get_current_admin)
):
    # Depending on MVP needs, a 'ban' could be distinct from a soft delete
    # but here we utilize the soft delete mechanism to completely lock out the account.
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_deleted = True
    user.deleted_at = func.now()
    
    audit = AuditLog(admin_id=admin.id, action="ban", entity_type="user", entity_id=str(user.id), details='{"reason": "admin_ban"}')
    db.add(audit)
    db.commit()
    
    return {"msg": "User banned and access revoked"}
