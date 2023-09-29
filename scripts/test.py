import requests


def change_model(model_name):
    url = "http://localhost:7860/sdapi/v1/options"
    payload = {
        "sd_model_checkpoint": model_name,   
    }

    response = requests.post(url, json=payload)
    reply = response.json()
    # print(reply["msg"])
    print(reply)
    return reply

# change_model("Reliberate-inpainting.safetensors [c54f90e540]")
change_model("Anime-inpainting.safetensors [5bca7e55ea]")