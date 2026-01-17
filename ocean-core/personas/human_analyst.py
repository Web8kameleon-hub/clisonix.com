from typing import Dict, Any


class HumanAnalyst:
    name = "Human Analyst"
    domain = "human"

    def answer(self, q: str, _: Dict[str, Any]) -> str:
        return (
            f"🧭 {self.name}\n"
            f"Pyetja: {q}\n"
            f"- Qëllimi u kuptua.\n"
            f"- Përgjigja do të jetë e qartë, e balancuar dhe njerëzore.\n"
        )
