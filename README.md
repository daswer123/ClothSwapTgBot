# Cloth Swap Tg Bot

Бот который умеет менять одежду, достаточно одно лишь промпта и фотографии. 
Работает с аниме и реальными людьми.

Совмещение технологии SAM ( segment anything ) и Stable Diffusion.
# Решение является PoC - Proof of concept

# Установка
1) У вас должен быть запущен Stable diffusion с флагом --api
2) Так же должно быть установленно расширение Adetailer, sd-webui-segment-anything , ControlNet 
   - 2.1) Модель для SAM 1.25GB sam_vit_l, её нужно кинуть в папку с  расширением sd-webui-segment-anything , https://dl.fbaipublicfiles.com/segment_anything/sam_vit_l_0b3195.pth 
   - 2.2) ip адаптер для controlNet https://huggingface.co/h94/IP-Adapter/resolve/main/models/ip-adapter_sd15.bin?download=true@
3) Откройте файл src/example.env.js и добавьте туда токен и адресс SD, после чео удалите приставку example. так что бы файл стал называтся env.js
4) Запустите файл install_python.bat

# Запуск
1) Запустите launch.bat

Что бы редактировать выбор, вы можете зайти в файл src\app\functions.js и на 70 строчке, вы можете добавить выборы по вашему желанию

# DEMO

https://github.com/daswer123/change_dress_bot/assets/22278673/3557506d-fdfd-4278-a29b-1941f7ac5665

