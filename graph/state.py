from typing import TypedDict,Optional

class State(TypedDict):
    mode : str
    file_path : Optional[str]
    github_url : Optional[str]
    video_url : Optional[str]
    content: str
    output: Optional[dict] | None