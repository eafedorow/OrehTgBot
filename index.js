const TelegramApi = require('node-telegram-bot-api');
const config = require('./config');

//Состояния бота для ТЕСТОВОЙ СИМУЛЯЦИИ поведения
let isNewQuestionProccess = false;
let isContactShare = false;
let isNewResidentProccess = false;
let isScheduleChecking = false;
let isFeedbackSending = false;

// КОНФИГУРАЦИЯ БОТА
const bot = new TelegramApi(config.TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// БЛОК КНОПОК
const botFunctionButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Ответы на вопросы', callback_data: '/faq'}],
            [{text: 'Подать заявку на резиденство', callback_data: '/newresident'}],
            [{text: 'Зарегистрироваться на мероприятие', callback_data: '/registration'}],
            [{text: 'Расписание мероприятий', callback_data: '/schedule'}],
            [{text: 'Заполнить анкету обратной связи', callback_data: '/feedback'}],
            [{text: 'Отправить ваш вопрос организаторам', callback_data: '/question'}],
        ]
    })
}
const questionsButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: '1. Что такое бизнес-инкубатор?', callback_data: '0'}],
            [{text: '2. Какова миссия бизнес-инкубатора?', callback_data: '1'}],
            [{text: '3. Какова цель бизнес-инкубатора?', callback_data: '2'}],
            [{text: '4. Какие услуги может предоставить?', callback_data: '3'}],
            [{text: '5. Какие задачи решает Б.И.?', callback_data: '4'}],
            [{text: '6. Для кого предназначен?', callback_data: '5'}],
            [{text: '7. Как работает?', callback_data: '6'}],
        ]
    })
}
const eventsButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Мероприятие #1', callback_data: 'event1'}],
            [{text: 'Мероприятие #2', callback_data: 'event2'}],
            [{text: 'Мероприятие #3', callback_data: 'event3'}],
        ]
    })
}
const newResidentButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Ввести вручную через бота', callback_data: 'manual'}],
            [{text: 'Прикрепить заполненный файл', callback_data: 'wordFile'}]
        ]
    })
}

const stopButton = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Стоп', callback_data: 'stop' }]
        ]
    })
}


// ДАННЫЕ
const answers = [
    '1. Что такое бизнес-инкубатор? \n\nБизнес-инкубатор «OREH» — структурное подразделение Арктического инновационного центра СВФУ. Бизнес-инкубатор (БИ) – это здание, в котором созданы условия, благоприятные для выживания новых и молодых компаний до момента, пока они не станут экономически сильными и не смогут конкурировать в рыночных условиях.'
    ,'2. Какова миссия бизнес-инкубатора?\n\nМиссия БИ OREH - поддержка инновационного предпринимательства и помощь в профессиональном росте резидентов БИ OREH для подготовки конкурентоспособных компаний и востребованных специалистов на рынке России и мира.'
    ,'3. Какова цель бизнес-инкубатора?\n\nЦель Бизнес-инкубатора OREH (далее – БИ OREH) - содействие развитию инновационного предпринимательства и адаптация резидентов к условиям реального рынка труда.'
    ,'4. Какие услуги может предоставить?\n\n' +
    '•\tсодействие созданию и развитию новых компаний в инновационной сфере; \n' +
    '•\tпомощь в организации прохождения стажировок резидентов в инновационных организациях, в том числе за рубежом;\n' +
    '•\tпроведение конференций, выставок, семинаров;\n'+
    '•\tсодействие привлечению инвестиций для реализации проектов резидентов БИ OREH;\n' +
    '•\tорганизация независимой экспертизы проектов и продукции, созданной резидентами БИ OREH; \n' +
    '•\tмаркетинговая экспертно-исследовательская деятельность и оказание маркетинговых услуг.\n'+
    '•\tподготовка исследований и обзоров рынка.\n'
    ,'5. Какие задачи решает Б.И.?\n\n•\tПодготовка, помощь, поддержка и обучение созданию востребованных и социально-значимых инновационных проектов и компаний.\n' +
    '•\tПроведение специализированных мероприятий для повышения конкурентоспособности резидентов в профессиональной деятельности и приобретения ими практических предпринимательских навыков.\n'
    ,'6. Для кого предназначен?\n\nБизнес-инкубатор поддерживает инновационные стартапы в любых отраслях. Каждый стартап может получить доступ к ресурсам и помощь экспертов инкубатора. Наиболее перспективные стартапы, прошедшие конкурсный отбор, получают офисные места и становятся резидентами инкубатора.'
    ,'7. Как рабоатет?\n\nБизнес-инкубатор дает возможность активным людям научиться наиболее совершенным методам построения бизнеса. Студенты и выпускники получают доступ к новым ресурсам, принимают участие в ориентированных на потребности предпринимателей мероприятия, становятся частью сообщества единомышленников.'
]

const eventsInfo = [
    {name: 'Мероприятие #1', date: `12:00 `+ new Date().toLocaleDateString()},
    {name: 'Мероприятие #2', date: `14:00 `+ new Date().toLocaleDateString()},
    {name: 'Мероприятие #3', date: `16:00 `+ new Date().toLocaleDateString()},
]


function setFalseAllStates() {
    isNewQuestionProccess = false;
    isContactShare = false;
    isNewResidentProccess = false;
    isScheduleChecking = false;
    isFeedbackSending = false;
}

const start = () =>{
    bot.setMyCommands([
        {command: '/help', description: 'Функционал бота'},
        {command: '/faq', description: 'Ответы на часто задаваемые вопросы'},
        {command: '/newresident', description: 'Заявка на резиденство'},
        {command: '/registration', description: 'Регистрация на мероприятие'},
        {command: '/schedule', description: 'Расписание мероприятий'},
        {command: '/feedback', description: 'Отправить обратную связь'},
        {command: '/question', description: 'Задать свой вопрос'},
    ]);

    bot.on('message', async msg =>{
        const text = msg.text;
        const chatId = msg.chat.id;
        console.log(msg);

        switch (text) {
            //СИМУЛЯЦИЯ работы основных команд
            case '/start':
                setFalseAllStates()
                return bot.sendMessage(chatId, `Привет!Я бот бизнес-инкубатора «OREH».\n\nВот что я умею:`, botFunctionButtons);
                break;
            case '/help':
                setFalseAllStates()
                return bot.sendMessage(chatId, `${msg.from.first_name}, вот что я умею:`, botFunctionButtons);
                break;
            case '/faq':
                setFalseAllStates()
                return bot.sendMessage(chatId, `Список вопросов на который я могу ответить:`, questionsButtons);
                break;

            case '/newresident':
                setFalseAllStates()
                isNewResidentProccess = true;
                return bot.sendMessage(chatId, `Пожалуйста, выберите в каком формате Вы хотите подать заявку.`, newResidentButtons);
                break;

            case '/registration':
                setFalseAllStates()
                let events = '';
                for (let i = 0; i < 3; i++) {
                    events += eventsInfo[i].name + '\n';
                    events += 'Дата мероприятия: ' + eventsInfo[i].date + '\n\n';
                }
                return bot.sendMessage(chatId, `Список грядущих мероприятий:\n\n${events}Нажмите на кнопку с соответствующим названием мероприятия.`, eventsButtons);
                break;

            case '/question':
                setFalseAllStates()
                isNewQuestionProccess = true;
                return bot.sendMessage(chatId, `${msg.from.first_name}, напишите, пожалуйста, Ваш вопрос, чтобы я мог отправить его на рассмотрение.`);
                break;

            case '/schedule':
                setFalseAllStates()
                isScheduleChecking= true;
                return bot.sendMessage(chatId, `Введите, пожалуйста, дату, на которую Вы хотите получить расписание в формаете \'${new Date().toLocaleDateString()}\' без кавычек.\n\nЧтобы отобразить функционал бота введите /help`);
                break;

            case '/feedback':
                setFalseAllStates()
                isFeedbackSending  = true;
                return bot.sendMessage(chatId, `Напишите Ваши пожелания по улучшению работы бизнес-инкубатора.`);
                break;
        }

        if(isNewResidentProccess){
            isNewResidentProccess = false;
            return bot.sendMessage(chatId, `Ваша заявка успешно отправлена!\n\nЧтобы отобразить функционал бота введите /help`);
        }
        if(isNewQuestionProccess){
            isContactShare = true;
            isNewQuestionProccess = false;

            return bot.sendMessage(chatId, `Оставьте, пожалуйста, свои контакты, чтобы мы могли с Вами связаться.`);
        }
        if(isContactShare){
            isContactShare = false;
            return bot.sendMessage(chatId, `Спасибо за вопрос! Сотрудники инкубатора свяжуться с Вами в ближайшее время. \n\nЧтобы отобразить часто задаваемые вопросы введите /faq\n\nЧтобы отобразить функционал бота введите /help`);
        }
        if(isFeedbackSending){
            isFeedbackSending = false;
            return bot.sendMessage(chatId, `Спасибо большое за обраную связь!\n\nЧтобы отобразить функционал бота введите /help`);
        }
        if(isScheduleChecking){
            const size = Math.floor(Math.random() * 3);

            let events = [];

            for(let i = 0; i < size; i++){
                if(i === 0) {
                    events.push({name: 'Мероприятие #' + i.toString(),date_start: "13:00", aud: 200 + i})
                }
                if(i === 1) {
                    events.push({name: 'Мероприятие #' + i.toString(),date_start: "14:00", aud: 200 + i})
                }
                if(i === 2) {
                    events.push({name: 'Мероприятие #' + i.toString(),date_start: "15:00", aud: 200 + i})
                }
            }
            let outputString = '';
            for(let i = 0; i < size; i++){
                outputString += events[i].name.toString() + '\n';
                outputString += 'Старт мероприятия: '+events[i].date_start.toString() + '\n';
                outputString += 'Аудитория: '+events[i].aud.toString() + '\n\n';
            }

            if(size === 0) {
                return bot.sendMessage(chatId, `Расписание на ${text}.\n\nНа текущую дату не найдено мероприятий.\n\nДля того, чтобы получить раписание на другую дату введите её, иначе же нажмите 'Стоп'\n\nЧтобы отобразить часто задаваемые вопросы введите /faq\n\nЧтобы отобразить функционал бота введите /help`, stopButton);
            }
            else {
                return bot.sendMessage(chatId, `Расписание на ${text}.\n\n${outputString}Для того, чтобы получить раписание на другую дату введите её, иначе же нажмите 'Стоп'.\n\nЧтобы отобразить часто задаваемые вопросы введите /faq\n\nЧтобы отобразить функционал бота введите /help`, stopButton);
            }
        }
        return bot.sendMessage(chatId, `Извини, но я пока что не понимаю что ты говоришь.`);
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        switch (data) {

            //СИМУЛЯЦИЯ работы основных команд
            case '/help':
                setFalseAllStates()
                return bot.sendMessage(chatId, `${msg.from.first_name}, вот что я умею:`, botFunctionButtons);
                break;
            case '/faq':
                setFalseAllStates()
                return bot.sendMessage(chatId, `Список вопросов на который я могу ответить:`, questionsButtons);
                break;

            case '/newresident':
                setFalseAllStates()
                isNewResidentProccess = true;
                return bot.sendMessage(chatId, `Пожалуйста, выберите в каком формате Вы хотите подать заявку.`, newResidentButtons);
                break;

            case '/registration':
                setFalseAllStates()
                let events = '';
                for (let i = 0; i < 3; i++) {
                    events += eventsInfo[i].name + '\n';
                    events += 'Дата мероприятия: ' + eventsInfo[i].date + '\n\n';
                }
                return bot.sendMessage(chatId, `Список грядущих мероприятий:\n\n${events}Нажмите на кнопку с соответствующим названием мероприятия.`, eventsButtons);
                break;

            case '/question':
                setFalseAllStates()
                isNewQuestionProccess = true;
                return bot.sendMessage(chatId, `${msg.from.first_name}, напишите, пожалуйста, Ваш вопрос, чтобы я мог отправить его на рассмотрение.`);
                break;

            case '/schedule':
                setFalseAllStates()
                isScheduleChecking= true;
                return bot.sendMessage(chatId, `Введите, пожалуйста, дату, на которую Вы хотите получить расписание в формаете \'${new Date().toLocaleDateString()}\' без кавычек.\n\nЧтобы отобразить функционал бота введите /help`);
                break;

            case '/feedback':
                setFalseAllStates()
                isFeedbackSending  = true;
                return bot.sendMessage(chatId, `Напишите Ваши пожелания по улучшению работы бизнес-инкубатора.`);
                break;

            //СИМУЛЯЦИЯ ответов на выбранный вопрос
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                return bot.sendMessage(chatId, `${answers[data].toString()}`);
                break;

            //СИМУЛЯЦИЯ выбора мероприятия
            case 'event1':
            case 'event2':
            case 'event3':
                return bot.sendMessage(chatId, `Вы успешно зарегистрированы на мероприятие!\n\nЧтобы отобразить функционал бота введите /help`);
                break;


            //СИМУЛЯЦИЯ выбора мероприятия
            case 'manual':
                return bot.sendMessage(chatId, `Введите полное название проекта.`);

            //СИМУЛЯЦИЯ выбора мероприятия
            case 'wordFile':
                return bot.sendMessage(chatId, `Ваша заявка успешно отправлена!`);

            //СИМУЛЯЦИЯ выбора мероприятия
            case 'stop':
                return bot.sendMessage(chatId, `Вот что я ещё умею:`, botFunctionButtons);
        }
    })
}
start();