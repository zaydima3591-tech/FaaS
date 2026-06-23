export default function handler(request, response) {
  // Получаем параметры из GET-запроса (например, /api/hello?name=Dima)
  const { name } = request.query;

  // Если имя не передали, возвращаем ошибку 400
  if (!name) {
    return response.status(400).json({ 
      success: false,
      error: "Имя не указано в параметрах запроса." 
    });
  }

  // Если всё ок, возвращаем успешный ответ со статусом 200
  return response.status(200).json({
    success: true,
    message: `Привет, ${name}! Этот ответ сгенерирован безсерверной функцией (FaaS).`,
    timestamp: new Date().toISOString()
  });
}