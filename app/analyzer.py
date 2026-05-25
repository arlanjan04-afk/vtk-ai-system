def analyze_priority(description, service_type=""):
    """Анализ приоритета заявки по ключевым словам на русском"""
    text = (description + " " + service_type).lower()

    # Срочные ключевые слова
    urgent_keywords = [
        "срочно", "немедленно", "сегодня", "сейчас", "военкомат",
        "повестка", "болезнь", "болею", "болен", "госпитализация",
        "авария", "потерял", "украли", "пожар"
    ]

    # Важные
    high_keywords = [
        "важно", "стипендия", "оплата", "общежитие", "экзамен",
        "сессия", "диплом", "защита", "практика", "грант",
        "отчисление", "академический отпуск"
    ]

    # Средние
    medium_keywords = [
        "хотел бы", "хотела бы", "планирую", "интересуюсь",
        "вопрос", "консультация", "справка", "узнать",
        "когда", "как получить"
    ]

    urgent_count = sum(1 for kw in urgent_keywords if kw in text)
    high_count = sum(1 for kw in high_keywords if kw in text)
    medium_count = sum(1 for kw in medium_keywords if kw in text)

    if urgent_count > 0:
        priority = "срочный"
        score = 90
        estimated = "В течение 1 дня"
    elif high_count > 0:
        priority = "высокий"
        score = 70
        estimated = "1-2 рабочих дня"
    elif medium_count > 0:
        priority = "средний"
        score = 50
        estimated = "2-3 рабочих дня"
    else:
        priority = "низкий"
        score = 30
        estimated = "3-5 рабочих дней"

    return {
        "priority": priority,
        "score": score,
        "estimated_time": estimated
    }


def analyze_sentiment(text):
    """Анализ тональности сообщения"""
    text_lower = text.lower()

    positive_words = [
        "спасибо", "отлично", "хорошо", "благодарю", "замечательно",
        "прекрасно", "рад", "счастлив", "доволен", "супер", "класс"
    ]

    negative_words = [
        "плохо", "ужасно", "проблема", "не работает", "не нравится",
        "недоволен", "жалоба", "возмущён", "разочарован", "беда",
        "не могу", "не получается", "сломалось", "ошибка"
    ]

    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)

    if pos_count > neg_count:
        return {"sentiment": "положительный", "score": pos_count}
    elif neg_count > pos_count:
        return {"sentiment": "отрицательный", "score": neg_count}
    else:
        return {"sentiment": "нейтральный", "score": 0}