from pydantic import BaseModel
from typing import Optional

class ClearanceStatusUpdate(BaseModel):
    status: str # pending, approved, rejected, locked
    
class GraduationApplicationCreate(BaseModel):
    pass # Currently no extra data needed to apply, just creates an entry
    
class ProjectSubmissionUpdate(BaseModel):
    project_report_url: Optional[str]
    project_ppt_url: Optional[str]
    source_code_url: Optional[str]
