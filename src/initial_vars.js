export const INITIAL_SESSION = {
    dino_thres: 0.4,
    Dino_categore_1: "clothes",
    Dino_categore_2: "bra, panties, underwear, shorts, garment",
    prompt_1: "bra, panties, underwear <lora:LowRA:0.7>",
    prompt_2: "detailed",
    den_str_1: 1.0,
    den_str_2: 0.1,
    den_str_3: 1.0,
    den_str_4: 0.1,
    one_mask: 1,
    debug: false,
    content_type: "real",
    person: "girl",
    mask_expand: 10,
    adetailer_str: 0.4,
    colorizePhoto: false,
    changeDress: false,
    photoToColorize: ""
}

// Инициализируем настройки и их описания
export const SETTINGS = {
    dino_thres: { value: INITIAL_SESSION.dino_thres, description: "Сила определения маски по категории, чем ниже тем больше будет шанс что нейросеть захватит больше чем нужно, но может быть так что на высоких значениях не всегда может поймать маску, поэтому держите значение от 0.3 до 0.5\n", short:"Сила определния маски" },
    Dino_categore_1: { value: INITIAL_SESSION.Dino_categore_1, description: "Категория определения маски, по умолчанию стоит 'clothes'\n", short:"Категория маски" },
    Dino_categore_2: { value: INITIAL_SESSION.Dino_categore_2, description: "Категория определения маски, в случае если в первый раз не дало результатов\n", short:"Категория маски 2" },
    prompt_1: { value: INITIAL_SESSION.prompt_1, description: "Подсказка, для изменения одежды, введите что вы хотите увидеть\n", short:"Основаня подсказка" },
    prompt_2: { value: INITIAL_SESSION.prompt_2, description: "Подсказка, для пост обработки\n",short:"Основаня подсказка 2"  },
    den_str_1: { value: INITIAL_SESSION.den_str_1, description: "Сила инпеинта, советую держать от 0.9 до 1\n",short:"Сила инпейнт 1"  },
    den_str_2: { value: INITIAL_SESSION.den_str_2, description: "Сила инпеинта для пост обработки\n",short:"Сила инпейнт 2" },
    den_str_3: { value: INITIAL_SESSION.den_str_3, description: "Сила инпеинта в случае режима маски 0\n",short:"Сила инпейнт 3" },
    den_str_4: { value: INITIAL_SESSION.den_str_4, description: "Сила инпеинта для пост обработки в случае режима маски 0\n", short:"Сила инпейнт 4" },
    one_mask: { value: INITIAL_SESSION.one_mask, description: "Режим маски\n0 - Маска старается найти 2 части верх и низ и по отдельности делает инпеинт\n1,2,3 - режимы маски, в которых берется только 1 маска которая и определяется цифрой 1,2,3,\nВсе маски можно увидеть если включить режим разработчика\n",short:"Режим работы маски" },
    debug: { value: INITIAL_SESSION.debug, description: "Режим разработчика, в этом режиме вместе с результатом , вам будет присылатся маска\n\nПишите только: \ntrue\nfalse", short:"Режим разработчика" },
    content_type: { value: INITIAL_SESSION.content_type, description: "Тип контента, на выбор всего 2\nreal\nanime\nвведите одно из 2-х\n",short:"Тип контента"  },
    person: { value: INITIAL_SESSION.person, description: "Кто изображен в кадре, на выбор 2 варианта\nboy\ngirl\nnвведите одно из 2-х значений\n", short:"Настройки персоны" },
    mask_expand: { value: INITIAL_SESSION.mask_expand, description: "На сколько сильно расширится маска, при больших значениях может хватать лишнее, а при маленьких будут лесенки\n", short:"Расширение маски" },
    adetailer_str: { value: INITIAL_SESSION.adetailer_str, description: "Сила исправления рук, чем больше тем сильнее держать от 0.4 до 0.7\n", short: "Сила исправления рук" }
}
