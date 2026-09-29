from app.services.cadastral.base import CadastralService
from app.services.cadastral.demo_provider import DemoCadastralProvider
from app.services.cadastral.maharashtra_provider import MaharashtraCadastralProvider

def get_cadastral_service(provider: str = "demo") -> CadastralService:
    if provider.lower() == "demo":
        return DemoCadastralProvider()
    elif provider.lower() == "maharashtra":
        return MaharashtraCadastralProvider()
    else:
        raise ValueError(f"Unknown cadastral provider: {provider}")