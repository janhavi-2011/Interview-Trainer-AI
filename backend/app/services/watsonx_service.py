from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
from app.core.config import get_settings

settings = get_settings()

# Initialize credentials
credentials = Credentials(
    url=settings.wx_url,
    api_key=settings.wx_api_key,
)

# Supported model in your IBM watsonx.ai project
GRANITE_MODEL = "ibm/granite-4-h-small"

# Backward compatibility
GRANITE_3_8B = GRANITE_MODEL

def get_model(model_id: str = GRANITE_MODEL, parameters: dict = None):
    """Create a model inference instance."""
    
    default_params = {
        GenParams.MAX_NEW_TOKENS: 1024,
        GenParams.TEMPERATURE: 0.7,
        GenParams.TOP_P: 0.9,
        GenParams.TOP_K: 50,
        GenParams.REPETITION_PENALTY: 1.1,
        
    }

    if parameters:
        default_params.update(parameters)

    model = ModelInference(
        model_id=model_id,
        credentials=credentials,
        project_id=settings.wx_project_id,
        params=default_params,
    )
    return model


def generate_response(
    prompt: str,
    model_id: str = GRANITE_MODEL,
    max_tokens: int = 1024,
    temperature: float = 0.7,
) -> str:
    """Generate a response from Granite model."""
    model = get_model(
        model_id=model_id,
        parameters={
            GenParams.MAX_NEW_TOKENS: max_tokens,
            GenParams.TEMPERATURE: temperature,
        },
    )

    response = model.generate(prompt=prompt)

    print("=" * 80)
    print("FULL IBM RESPONSE")
    print(response)
    print("=" * 80)

    return response["results"][0]["generated_text"]

def generate_response_with_details(
    prompt: str,
    model_id: str = GRANITE_3_8B,
    max_tokens: int = 1024,
    temperature: float = 0.7,
) -> dict:
    """Generate a response with full details including metadata."""
    model = get_model(
        model_id=model_id,
        parameters={
            GenParams.MAX_NEW_TOKENS: max_tokens,
            GenParams.TEMPERATURE: temperature,
        },
    )

    response = model.generate(prompt=prompt)
    
    result = {
        "generated_text": response["results"][0]["generated_text"],
        "model_id": model_id,
        "input_token_count": response["results"][0].get("input_token_count", 0),
        "generated_token_count": response["results"][0].get("generated_token_count", 0),
    }
    return result